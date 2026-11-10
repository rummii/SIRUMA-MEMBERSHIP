import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TIER_CONFIG } from "../src/lib/tiers";
import { addYears, createQrToken } from "../src/lib/membership";

const prisma = new PrismaClient();

async function createStaff() {
  await prisma.user.upsert({
    where: { email: "admin@siruma.ph" },
    update: {},
    create: {
      name: "Club Administrator",
      email: "admin@siruma.ph",
      phone: "+63 917 100 0001",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "frontdesk@siruma.ph" },
    update: {},
    create: {
      name: "Front Desk Officer",
      email: "frontdesk@siruma.ph",
      phone: "+63 917 100 0002",
      passwordHash: await bcrypt.hash("Frontdesk123!", 12),
      role: "STAFF",
    },
  });

  return staff;
}

type MemberSeed = {
  name: string;
  email: string;
  phone: string;
  password: string;
  tier: "PREMIUM" | "VIP";
  memberNumber: string;
  creditUsed?: number;
};

async function createMember(member: MemberSeed, staffId: string) {
  const existing = await prisma.user.findUnique({
    where: { email: member.email },
    include: { membership: true },
  });
  if (existing) return existing;

  const config = TIER_CONFIG[member.tier];
  const start = new Date();
  const creditUsed = member.creditUsed ?? 0;
  const balance = config.creditBalance - creditUsed;
  const qrToken = createQrToken();

  const user = await prisma.user.create({
    data: {
      name: member.name,
      email: member.email,
      phone: member.phone,
      passwordHash: await bcrypt.hash(member.password, 12),
      role: "MEMBER",
      membership: {
        create: {
          memberNumber: member.memberNumber,
          qrToken,
          tier: member.tier,
          validFrom: start,
          validUntil: addYears(start, 1),
          creditBalance: balance,
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

  const membership = user.membership!;

  await prisma.transaction.create({
    data: {
      type: "TOP_UP",
      amount: config.creditBalance,
      outlet: "ENTRANCE",
      note: "Initial privilege credit allocation",
      membershipId: membership.id,
      processedByStaffId: staffId,
    },
  });

  if (creditUsed > 0) {
    await prisma.transaction.create({
      data: {
        type: "CREDIT_DEDUCTION",
        amount: creditUsed,
        outlet: "CABANA",
        note: "Cabana rental — seed usage",
        membershipId: membership.id,
        processedByStaffId: staffId,
      },
    });
  }

  return user;
}

async function main() {
  const staff = await createStaff();

  const premium = await createMember(
    {
      name: "Ana Marie Reyes",
      email: "premium@siruma.ph",
      phone: "+63 917 555 0101",
      password: "Member123!",
      tier: "PREMIUM",
      memberNumber: "SHB-00001",
    },
    staff.id,
  );

  const vip = await createMember(
    {
      name: "Miguel Santos",
      email: "vip@siruma.ph",
      phone: "+63 917 555 0102",
      password: "Member123!",
      tier: "VIP",
      memberNumber: "SHB-00002",
      creditUsed: 1500,
    },
    staff.id,
  );

  // A completed VIP stay that redeemed two complimentary nights.
  if (vip.membership) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - 45);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const existingReservation = await prisma.reservation.findFirst({
      where: { membershipId: vip.membership.id },
    });

    if (!existingReservation) {
      await prisma.reservation.create({
        data: {
          membershipId: vip.membership.id,
          checkIn,
          checkOut,
          guestCount: 6,
          isComplimentaryStay: true,
          discountApplied: 0.3,
          upgradeStatus: "COMPLIMENTARY",
          earlyCheckinHours: 2,
          lateCheckoutHours: 2,
          status: "COMPLETED",
        },
      });

      await prisma.membership.update({
        where: { id: vip.membership.id },
        data: { complimentaryStayUsed: 2 },
      });
    }
  }

  // An upcoming Premium stay.
  if (premium.membership) {
    const existingReservation = await prisma.reservation.findFirst({
      where: { membershipId: premium.membership.id },
    });

    if (!existingReservation) {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 21);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 1);

      await prisma.reservation.create({
        data: {
          membershipId: premium.membership.id,
          checkIn,
          checkOut,
          guestCount: 4,
          isComplimentaryStay: false,
          discountApplied: 0.2,
          upgradeStatus: "PREFERRED_RATE",
          earlyCheckinHours: 1,
          lateCheckoutHours: 0,
          status: "CONFIRMED",
        },
      });
    }
  }

  console.log("Seed complete");
  console.log("Admin:      admin@siruma.ph / Admin123!");
  console.log("Front desk: frontdesk@siruma.ph / Frontdesk123!");
  console.log("Premium:    premium@siruma.ph / Member123! (SHB-00001)");
  console.log("VIP:        vip@siruma.ph / Member123! (SHB-00002)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

