"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { TIER_CONFIG } from "@/lib/tiers";
import {
  addYears,
  createQrToken,
  nextMemberNumber,
} from "@/lib/membership";
import type { FormState } from "@/app/actions/auth";
import type {
  MembershipStatus,
  Outlet,
  Tier,
  TransactionType,
} from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function setMembershipStatusAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Only administrators can update memberships." };

  const membershipId = String(formData.get("membershipId") ?? "");
  const status = String(formData.get("status") ?? "") as MembershipStatus;

  const allowed: MembershipStatus[] = ["ACTIVE", "SUSPENDED", "EXPIRED"];
  if (!membershipId || !allowed.includes(status)) {
    return { error: "Invalid membership update." };
  }

  const membership = await db.membership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) return { error: "Membership not found." };

  await db.membership.update({
    where: { id: membershipId },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/members/${membershipId}`);
  return { success: `Membership marked ${status.toLowerCase()}.` };
}

export async function extendMembershipAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Only administrators can update memberships." };

  const membershipId = String(formData.get("membershipId") ?? "");
  const years = Number(formData.get("years") ?? 1);

  if (!membershipId || !Number.isInteger(years) || years < 1 || years > 5) {
    return { error: "Choose a renewal period between 1 and 5 years." };
  }

  const membership = await db.membership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) return { error: "Membership not found." };

  const base =
    membership.validUntil > new Date() ? membership.validUntil : new Date();

  await db.membership.update({
    where: { id: membershipId },
    data: { validUntil: addYears(base, years), status: "ACTIVE" },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/members/${membershipId}`);
  return {
    success: `Membership renewed for ${years} year${years === 1 ? "" : "s"}.`,
  };
}

export async function adjustCreditAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Only administrators can adjust credits." };

  const membershipId = String(formData.get("membershipId") ?? "");
  const type = String(formData.get("type") ?? "") as TransactionType;
  const outlet = String(formData.get("outlet") ?? "") as Outlet;
  const note = String(formData.get("note") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  const types: TransactionType[] = ["TOP_UP", "REFUND", "CREDIT_DEDUCTION"];
  const outlets: Outlet[] = [
    "RESTAURANT",
    "CABANA",
    "ACTIVITIES",
    "ENTRANCE",
    "ROOM",
  ];

  if (!membershipId) return { error: "Missing membership reference." };
  if (!types.includes(type)) return { error: "Choose a valid adjustment type." };
  if (!outlets.includes(outlet)) return { error: "Choose a valid outlet." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }
  if (!note) return { error: "Add a short note explaining the adjustment." };

  const membership = await db.membership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) return { error: "Membership not found." };

  try {
    await db.$transaction(async (tx) => {
      if (type === "CREDIT_DEDUCTION") {
        // Atomic guard: only decrement when the balance is sufficient.
        const result = await tx.membership.updateMany({
          where: { id: membershipId, creditBalance: { gte: amount } },
          data: { creditBalance: { decrement: amount } },
        });
        if (result.count === 0) {
          throw new InsufficientCreditError();
        }
      } else {
        await tx.membership.update({
          where: { id: membershipId },
          data: { creditBalance: { increment: amount } },
        });
      }

      await tx.transaction.create({
        data: {
          type,
          amount,
          outlet,
          note,
          membershipId,
          processedByStaffId: admin.id,
        },
      });
    });
  } catch (error) {
    if (error instanceof InsufficientCreditError) {
      return { error: "Insufficient credit balance for this adjustment." };
    }
    console.error("Credit adjustment failed", error);
    return { error: "Could not adjust credits. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/members/${membershipId}`);
  revalidatePath("/portal");
  return { success: "Credit adjustment recorded." };
}

export async function issueMembershipAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Only administrators can issue memberships." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const tierInput = String(formData.get("tier") ?? "PREMIUM");
  const tier: Tier | null =
    tierInput === "PREMIUM" || tierInput === "VIP" ? tierInput : null;

  if (name.length < 2) return { error: "Enter the member's full name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "The temporary password must be at least 8 characters." };
  }
  if (!tier) return { error: "Choose PREMIUM or VIP." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "A member with this email already exists." };

  const config = TIER_CONFIG[tier];

  await db.$transaction(async (tx) => {
    const highest = await tx.membership.findFirst({
      orderBy: { memberNumber: "desc" },
      select: { memberNumber: true },
    });

    const start = new Date();
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: await bcrypt.hash(password, 12),
        role: "MEMBER",
        membership: {
          create: {
            memberNumber: nextMemberNumber(highest?.memberNumber),
            qrToken: createQrToken(),
            tier,
            validFrom: start,
            validUntil: addYears(start, 1),
            creditBalance: config.creditBalance,
            complimentaryStayQuota: config.complimentaryStays,
            freeGuestQuota: config.freeGuests,
            discountPercent: config.discountPercent,
            advanceBookingDays: config.advanceBookingDays,
            status: "ACTIVE",
          },
        },
      },
      include: { membership: true },
    });

    if (user.membership) {
      await tx.transaction.create({
        data: {
          type: "TOP_UP",
          amount: config.creditBalance,
          outlet: "ENTRANCE",
          note: "Initial privilege credit allocation (manual card issue)",
          membershipId: user.membership.id,
          processedByStaffId: admin.id,
        },
      });
    }
  });

  revalidatePath("/admin");
  return {
    success: `Membership issued for ${name}. They can sign in with the temporary password.`,
  };
}

class InsufficientCreditError extends Error {
  constructor() {
    super("Insufficient credit balance");
    this.name = "InsufficientCreditError";
  }
}

