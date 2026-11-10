import crypto from "node:crypto";
import type { Outlet, Tier } from "@prisma/client";
import { getTierConfig } from "@/lib/tiers";

/** Generates the next member number in the SHB-##### series. */
export function nextMemberNumber(highestExisting: string | null | undefined) {
  const current = highestExisting
    ? Number.parseInt(highestExisting.replace(/[^0-9]/g, ""), 10)
    : 0;
  const next = Number.isFinite(current) ? current + 1 : 1;
  return `SHB-${String(next).padStart(5, "0")}`;
}

/** Opaque, unguessable token embedded in the member QR code. */
export function createQrToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function addYears(date: Date, years: number) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function checkinBufferHours(tier: Tier) {
  return getTierConfig(tier).checkinBufferHours;
}

export const TIER_LABELS: Record<Tier, string> = {
  PREMIUM: "Premium",
  VIP: "VIP",
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  EXPIRED: "Expired",
};

export const OUTLET_LABELS: Record<Outlet, string> = {
  RESTAURANT: "Restaurant & Bar",
  CABANA: "Cabana rental",
  ACTIVITIES: "Activities",
  ENTRANCE: "Entrance fees",
  ROOM: "Room charges",
};

export const TRANSACTION_LABELS: Record<string, string> = {
  CREDIT_DEDUCTION: "Deduction",
  REFUND: "Refund",
  TOP_UP: "Top-up",
};

export const UPGRADE_LABELS: Record<string, string> = {
  NONE: "Standard",
  PREFERRED_RATE: "Preferred rate",
  COMPLIMENTARY: "Complimentary upgrade",
};

export const RESERVATION_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

