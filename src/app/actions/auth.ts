"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { TIER_CONFIG } from "@/lib/tiers";
import {
  addYears,
  createQrToken,
  nextMemberNumber,
} from "@/lib/membership";
import type { Tier } from "@prisma/client";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/portal",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function registerAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const tierInput = String(formData.get("tier") ?? "PREMIUM");

  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) fieldErrors.name = "Please enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    fieldErrors.email = "Please enter a valid email address.";
  if (password.length < 8)
    fieldErrors.password = "Use at least 8 characters for your password.";
  if (password !== confirmPassword)
    fieldErrors.confirmPassword = "Passwords do not match.";

  const tier: Tier | null =
    tierInput === "PREMIUM" || tierInput === "VIP" ? tierInput : null;
  if (!tier) fieldErrors.tier = "Select a valid membership tier.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, error: "Please review the highlighted fields." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      fieldErrors: { email: "An account with this email already exists." },
      error: "An account with this email already exists.",
    };
  }

  const config = TIER_CONFIG[tier!];

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await db.$transaction(async (tx) => {
      const highest = await tx.membership.findFirst({
        orderBy: { memberNumber: "desc" },
        select: { memberNumber: true },
      });

      const start = new Date();

      await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          role: "MEMBER",
          membership: {
            create: {
              memberNumber: nextMemberNumber(highest?.memberNumber),
              qrToken: createQrToken(),
              tier: tier!,
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
      });
    });
  } catch (error) {
    console.error("Registration failed", error);
    return { error: "We could not create your account. Please try again." };
  }

  redirect("/login?registered=1");
}

