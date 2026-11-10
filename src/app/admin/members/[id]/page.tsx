import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Crown, Percent, Users } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { MembershipCard } from "@/components/membership-card";
import { LedgerTable } from "@/components/portal/ledger-table";
import { ReservationsTable } from "@/components/portal/reservations-table";
import { CreditAdjustForm } from "@/components/admin/credit-adjust-form";
import { MembershipControls } from "@/components/admin/membership-controls";
import { Badge, statusTone } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABELS, TIER_LABELS } from "@/lib/membership";
import { formatCurrency, formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") {
    redirect(session.user.role === "STAFF" ? "/desk" : "/portal");
  }

  const { id } = await params;

  const membership = await db.membership.findUnique({
    where: { id },
    include: {
      user: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        include: { processedBy: { select: { name: true } } },
      },
      reservations: { orderBy: { checkIn: "desc" } },
    },
  });

  if (!membership) notFound();

  const balance = Number(membership.creditBalance);
  const staysRemaining = Math.max(
    0,
    membership.complimentaryStayQuota - membership.complimentaryStayUsed,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
              {initials(membership.user.name)}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {membership.user.name}
              </h1>
              <p className="text-sm text-slate-500">
                {membership.user.email}
                {membership.user.phone ? ` · ${membership.user.phone}` : ""}
              </p>
              <p className="mt-1 font-mono text-xs font-semibold text-slate-600">
                {membership.memberNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(membership.status)}>
              {STATUS_LABELS[membership.status]}
            </Badge>
            <Badge tone="gold">
              <Crown className="h-3 w-3" />
              {TIER_LABELS[membership.tier]}
            </Badge>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <MembershipCard
              memberName={membership.user.name}
              memberNumber={membership.memberNumber}
              tier={membership.tier}
              status={membership.status}
              validUntil={membership.validUntil.toISOString()}
              qrToken={membership.qrToken}
            />

            <Card>
              <CardHeader>
                <CardTitle>Membership details</CardTitle>
                <CardDescription>
                  Entitlements and validity for this {TIER_LABELS[membership.tier]}{" "}
                  member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <Detail
                    label="Credit balance"
                    value={formatCurrency(balance)}
                  />
                  <Detail
                    label="Free nights remaining"
                    value={`${staysRemaining} of ${membership.complimentaryStayQuota}`}
                  />
                  <Detail
                    label="Room discount"
                    value={`${Math.round(
                      Number(membership.discountPercent) * 100,
                    )}%`}
                  />
                  <Detail
                    label="Free guests"
                    value={`+${membership.freeGuestQuota}`}
                  />
                  <Detail
                    label="Booking window"
                    value={`${membership.advanceBookingDays} days`}
                  />
                  <Detail
                    label="Valid from"
                    value={formatDate(membership.validFrom)}
                  />
                  <Detail
                    label="Valid until"
                    value={formatDate(membership.validUntil)}
                  />
                  <Detail
                    label="Issued"
                    value={formatDate(membership.createdAt)}
                  />
                </dl>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Adjust privilege credits</CardTitle>
                <CardDescription>
                  Top-ups, refunds, and manual deductions are written to the
                  audit trail.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreditAdjustForm
                  membershipId={membership.id}
                  creditBalance={balance}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership controls</CardTitle>
                <CardDescription>
                  Suspend, reactivate, expire, or renew this membership.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MembershipControls
                  membershipId={membership.id}
                  status={membership.status}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction audit trail</CardTitle>
            <CardDescription>
              {membership.transactions.length} entr
              {membership.transactions.length === 1 ? "y" : "ies"} recorded for
              this membership, newest first.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LedgerTable transactions={membership.transactions} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reservation logs</CardTitle>
            <CardDescription>
              {membership.reservations.length} stay
              {membership.reservations.length === 1 ? "" : "s"} recorded,
              including complimentary redemptions and flexible hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ReservationsTable reservations={membership.reservations} />
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Percent className="h-3 w-3" />
            {Math.round(Number(membership.discountPercent) * 100)}% member rate
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            +{membership.freeGuestQuota} complimentary guests
          </span>
          <span>
            Last updated {formatDate(membership.updatedAt)}
          </span>
        </div>
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
