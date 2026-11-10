import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  Clock,
  CreditCard,
  Crown,
  HandCoins,
  Percent,
  Ticket,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { MembershipCard } from "@/components/membership-card";
import { LedgerTable } from "@/components/portal/ledger-table";
import { ReservationsTable } from "@/components/portal/reservations-table";
import { ProfileForm } from "@/components/portal/profile-form";
import { StatCard } from "@/components/portal/stat-card";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABELS, TIER_LABELS } from "@/lib/membership";
import { getTierConfig } from "@/lib/tiers";
import { formatCurrency, formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Member portal" };

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "ADMIN" || session.user.role === "STAFF") {
    redirect("/desk");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      membership: {
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 12 },
          reservations: { orderBy: { checkIn: "desc" }, take: 12 },
        },
      },
    },
  });

  if (!user) redirect("/login");
  const membership = user.membership;

  if (!membership) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>No membership on file</CardTitle>
              <CardDescription>
                Your account does not have a membership yet. Apply for a tier to
                get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button>Apply for membership</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const config = getTierConfig(membership.tier);
  const balance = Number(membership.creditBalance);
  const staysRemaining = Math.max(
    0,
    membership.complimentaryStayQuota - membership.complimentaryStayUsed,
  );
  const tone = statusTone(membership.status);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
              {initials(user.name)}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome, {user.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={tone}>{STATUS_LABELS[membership.status]}</Badge>
            <Badge tone="gold">
              <Crown className="h-3 w-3" />
              {TIER_LABELS[membership.tier]}
            </Badge>
          </div>
        </div>

        {membership.status !== "ACTIVE" ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <p className="font-semibold">
              Your membership is {membership.status.toLowerCase()}.
            </p>
            <p className="mt-1 text-amber-800">
              Please contact the club&apos;s membership team at the front desk.
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <MembershipCard
              memberName={user.name}
              memberNumber={membership.memberNumber}
              tier={membership.tier}
              status={membership.status}
              validUntil={membership.validUntil.toISOString()}
              qrToken={membership.qrToken}
            />
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Ticket className="h-3.5 w-3.5 text-slate-400" />
              This QR code is verified at the front desk for entry and
              privileges.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<HandCoins className="h-4 w-4" />}
              label="Credit wallet"
              value={formatCurrency(balance)}
              hint={`of ${formatCurrency(config.creditBalance)} allowance`}
            />
            <StatCard
              icon={<CalendarClock className="h-4 w-4" />}
              label="Free nights"
              value={`${staysRemaining} of ${membership.complimentaryStayQuota}`}
              hint={`${membership.complimentaryStayUsed} used this year`}
            />
            <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Free guests"
              value={`+${membership.freeGuestQuota}`}
              hint="per visit, member included"
            />
            <StatCard
              icon={<Percent className="h-4 w-4" />}
              label="Room discount"
              value={`${Math.round(Number(membership.discountPercent) * 100)}%`}
              hint={config.upgradeLabel}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Booking window"
              value={`${membership.advanceBookingDays} days`}
              hint="priority lead time"
            />
            <StatCard
              icon={<CreditCard className="h-4 w-4" />}
              label="Valid until"
              value={formatDate(membership.validUntil)}
              hint={`member since ${formatDate(membership.validFrom)}`}
            />
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reservation history</CardTitle>
            <CardDescription>
              Your stays, complimentary nights, and flexible check-in
              privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ReservationsTable reservations={membership.reservations} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Credit ledger</CardTitle>
            <CardDescription>
              Every privilege-credit movement on your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LedgerTable transactions={membership.transactions} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Keep your contact information up to date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={user.name}
              email={user.email}
              phone={user.phone}
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your {TIER_LABELS[membership.tier]} privileges</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {config.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700"
                >
                  <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
