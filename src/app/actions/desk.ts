"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import {
  OUTLET_LABELS,
  TRANSACTION_LABELS,
  checkinBufferHours,
} from "@/lib/membership";
import { parseQrPayload } from "@/lib/qr";
import type { Outlet, UpgradeStatus } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "STAFF")) return null;
  return session.user;
}

export type VerifiedTransaction = {
  id: string;
  type: string;
  typeLabel: string;
  amount: number;
  outletLabel: string;
  note: string;
  createdAt: string;
};

export type VerifiedMember = {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string | null;
  tier: string;
  status: string;
  validFrom: string;
  validUntil: string;
  creditBalance: number;
  stayQuota: number;
  stayUsed: number;
  freeGuestQuota: number;
  discountPercent: number;
  advanceBookingDays: number;
  checkinBufferHours: number;
  transactions: VerifiedTransaction[];
};

export type VerifyState = {
  error?: string;
  member?: VerifiedMember;
};

export async function verifyMemberAction(
  _prevState: VerifyState | undefined,
  formData: FormData,
): Promise<VerifyState> {
  const staff = await requireStaff();
  if (!staff) return { error: "Sign in as front-desk staff to verify members." };

  const raw = String(formData.get("code") ?? "").trim();
  if (!raw) return { error: "Scan a member QR code or enter a member number." };

  const payload = parseQrPayload(raw);
  if (!payload) {
    return {
      error:
        "That code could not be read. Use the member's SHB-number or rescan the QR card.",
    };
  }

  const membership = await db.membership.findUnique({
    where: { memberNumber: payload.memberNumber.toUpperCase() },
    include: {
      user: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!membership) {
    return { error: `No membership found for ${payload.memberNumber}.` };
  }

  if (payload.token && payload.token !== membership.qrToken) {
    return { error: "This QR code is not valid for the member number scanned." };
  }

  return {
    member: {
      id: membership.id,
      memberNumber: membership.memberNumber,
      name: membership.user.name,
      email: membership.user.email,
      phone: membership.user.phone,
      tier: membership.tier,
      status: membership.status,
      validFrom: membership.validFrom.toISOString(),
      validUntil: membership.validUntil.toISOString(),
      creditBalance: Number(membership.creditBalance),
      stayQuota: membership.complimentaryStayQuota,
      stayUsed: membership.complimentaryStayUsed,
      freeGuestQuota: membership.freeGuestQuota,
      discountPercent: Number(membership.discountPercent),
      advanceBookingDays: membership.advanceBookingDays,
      checkinBufferHours: checkinBufferHours(membership.tier),
      transactions: membership.transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        typeLabel:
          TRANSACTION_LABELS[transaction.type] ?? transaction.type,
        amount: Number(transaction.amount),
        outletLabel:
          OUTLET_LABELS[transaction.outlet] ?? transaction.outlet,
        note: transaction.note,
        createdAt: transaction.createdAt.toISOString(),
      })),
    },
  };
}

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function deductCreditAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const staff = await requireStaff();
  if (!staff) return { error: "You are not authorized to deduct credits." };

  const membershipId = String(formData.get("membershipId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const outlet = String(formData.get("outlet") ?? "") as Outlet;
  const note = String(formData.get("note") ?? "").trim();

  const outlets: Outlet[] = [
    "RESTAURANT",
    "CABANA",
    "ACTIVITIES",
    "ENTRANCE",
    "ROOM",
  ];

  if (!membershipId) return { error: "Verify a member first." };
  if (!outlets.includes(outlet)) return { error: "Choose a valid outlet." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a deduction amount greater than zero." };
  }
  if (!note) return { error: "Add a short note for the ledger." };

  const membership = await db.membership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) return { error: "Membership not found." };
  if (membership.status !== "ACTIVE") {
    return { error: "This membership is not active." };
  }

  try {
    await db.$transaction(async (tx) => {
      // Atomic balance guard: prevents overdrafts under concurrent deductions.
      const result = await tx.membership.updateMany({
        where: { id: membershipId, creditBalance: { gte: amount } },
        data: { creditBalance: { decrement: amount } },
      });
      if (result.count === 0) {
        throw new InsufficientCreditError();
      }

      await tx.transaction.create({
        data: {
          type: "CREDIT_DEDUCTION",
          amount,
          outlet,
          note,
          membershipId,
          processedByStaffId: staff.id,
        },
      });
    });
  } catch (error) {
    if (error instanceof InsufficientCreditError) {
      return {
        error: `Insufficient credit balance. Available: ₱${Number(
          membership.creditBalance,
        ).toLocaleString("en-PH")}.`,
      };
    }
    console.error("Deduction failed", error);
    return { error: "Could not record the deduction. Please try again." };
  }

  revalidatePath("/desk");
  revalidatePath("/portal");
  return {
    success: `Deducted ₱${amount.toLocaleString("en-PH")} from ${membership.memberNumber}.`,
  };
}

class InsufficientCreditError extends Error {
  constructor() {
    super("Insufficient credit balance");
    this.name = "InsufficientCreditError";
  }
}

export async function checkInAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const staff = await requireStaff();
  if (!staff) return { error: "You are not authorized to check members in." };

  const membershipId = String(formData.get("membershipId") ?? "");
  const guestCount = Number(formData.get("guestCount") ?? 0);
  const nights = Number(formData.get("nights") ?? 1);
  const isComplimentaryStay = formData.get("isComplimentaryStay") === "on";
  const earlyHours = Number(formData.get("earlyCheckinHours") ?? 0);
  const lateHours = Number(formData.get("lateCheckoutHours") ?? 0);
  const upgradeStatus = String(
    formData.get("upgradeStatus") ?? "NONE",
  ) as UpgradeStatus;

  if (!membershipId) return { error: "Verify a member first." };
  if (!Number.isInteger(guestCount) || guestCount < 0) {
    return { error: "Enter the number of accompanying guests." };
  }
  if (!Number.isInteger(nights) || nights < 1 || nights > 30) {
    return { error: "Stay length must be between 1 and 30 nights." };
  }

  const membership = await db.membership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) return { error: "Membership not found." };

  if (membership.status !== "ACTIVE") {
    return { error: "This membership is not active — check-in declined." };
  }
  if (membership.validUntil < new Date()) {
    return { error: "This membership has expired — check-in declined." };
  }

  const buffer = checkinBufferHours(membership.tier);

  if (guestCount > membership.freeGuestQuota) {
    return {
      error: `Guest headcount exceeds the ${membership.tier} quota of +${membership.freeGuestQuota} guests.`,
    };
  }
  if (earlyHours > buffer || lateHours > buffer) {
    return {
      error: `Flexible hours exceed the ${membership.tier} allowance of ${buffer} hour${
        buffer === 1 ? "" : "s"
      }.`,
    };
  }
  if (isComplimentaryStay) {
    const remaining =
      membership.complimentaryStayQuota - membership.complimentaryStayUsed;
    if (remaining < nights) {
      return {
        error: `Only ${remaining} complimentary night${
          remaining === 1 ? "" : "s"
        } remain for this member.`,
      };
    }
  }
  if (upgradeStatus === "COMPLIMENTARY" && membership.tier !== "VIP") {
    return {
      error:
        "Complimentary upgrades are a VIP privilege. Use preferred rate for Premium members.",
    };
  }

  const checkIn = new Date();
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + nights);

  try {
    await db.$transaction(async (tx) => {
      if (isComplimentaryStay) {
        // Atomic guard so two desks cannot redeem the same nights.
        const result = await tx.membership.updateMany({
          where: {
            id: membershipId,
            complimentaryStayUsed: {
              lte: membership.complimentaryStayQuota - nights,
            },
          },
          data: { complimentaryStayUsed: { increment: nights } },
        });
        if (result.count === 0) {
          throw new InsufficientStayError();
        }
      }

      await tx.reservation.create({
        data: {
          membershipId,
          checkIn,
          checkOut,
          guestCount,
          isComplimentaryStay,
          discountApplied: membership.discountPercent,
          upgradeStatus,
          earlyCheckinHours: earlyHours,
          lateCheckoutHours: lateHours,
          status: "CHECKED_IN",
        },
      });
    });
  } catch (error) {
    if (error instanceof InsufficientStayError) {
      return { error: "Complimentary nights are no longer available." };
    }
    console.error("Check-in failed", error);
    return { error: "Could not check the member in. Please try again." };
  }

  revalidatePath("/desk");
  revalidatePath("/portal");
  return {
    success: `Checked in ${membership.memberNumber} for ${nights} night${
      nights === 1 ? "" : "s"
    }${isComplimentaryStay ? " (complimentary)" : ""}.`,
  };
}

class InsufficientStayError extends Error {
  constructor() {
    super("Insufficient complimentary nights");
    this.name = "InsufficientStayError";
  }
}


