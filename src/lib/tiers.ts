import type { Tier } from "@prisma/client";

export type TierConfig = {
  tier: Tier;
  label: string;
  fee: number;
  discountPercent: number; // fraction, e.g. 0.2
  complimentaryStays: number;
  freeGuests: number;
  creditBalance: number;
  advanceBookingDays: number;
  checkinBufferHours: number;
  upgradeLabel: string;
  color: string;
  tagline: string;
  description: string;
  benefits: string[];
};

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  PREMIUM: {
    tier: "PREMIUM",
    label: "Premium",
    fee: 100000,
    discountPercent: 0.2,
    complimentaryStays: 3,
    freeGuests: 4,
    creditBalance: 20000,
    advanceBookingDays: 30,
    checkinBufferHours: 1,
    upgradeLabel: "Preferred member upgrade rates",
    color: "#64748b",
    tagline: "The essential highland membership.",
    description:
      "Premium membership opens the club to you and your guests with a 20% room discount, three complimentary nights, and a ₱20,000 privilege credit wallet each year.",
    benefits: [
      "20% off standard room rates",
      "3 complimentary nights per year",
      "Member + 4 complimentary guests",
      "₱20,000 resort privilege credits",
      "Priority booking up to 30 days ahead",
      "1-hour early check-in / late check-out",
      "Preferred member upgrade rates",
    ],
  },
  VIP: {
    tier: "VIP",
    label: "VIP",
    fee: 150000,
    discountPercent: 0.3,
    complimentaryStays: 5,
    freeGuests: 8,
    creditBalance: 35000,
    advanceBookingDays: 60,
    checkinBufferHours: 2,
    upgradeLabel: "Complimentary room upgrades (subject to availability)",
    color: "#0f766e",
    tagline: "First priority, every visit.",
    description:
      "VIP membership is the club's highest tier: a 30% room discount, five complimentary nights, ₱35,000 in credits, and first-priority booking up to 60 days in advance.",
    benefits: [
      "30% off standard room rates",
      "5 complimentary nights per year",
      "Member + 8 complimentary guests",
      "₱35,000 resort privilege credits",
      "60-day priority booking window (first priority)",
      "2-hour early check-in / late check-out",
      "Complimentary room upgrades (subject to availability)",
      "Enhanced VIP family privileges and birthday priority",
    ],
  },
};

export const TIER_ORDER: Tier[] = ["PREMIUM", "VIP"];

export function getTierConfig(tier: Tier): TierConfig {
  return TIER_CONFIG[tier];
}
