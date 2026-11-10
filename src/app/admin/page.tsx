import { redirect } from "next/navigation";
import { BadgeCheck, Crown, ShieldAlert, Users } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { MemberDirectory } from "@/components/admin/member-directory";
import { IssueCardForm } from "@/components/admin/issue-card-form";
import { StatTile } from "@/components/admin/stat-tile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MembershipStatus, Tier } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

type Search = {
  tier?: string;
  status?: string;
  q?: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") {
    redirect(session.user.role === "STAFF" ? "/desk" : "/portal");
  }

  const params = await searchParams;
  const tierFilter: Tier | undefined =
    params.tier === "PREMIUM" || params.tier === "VIP" ? params.tier : undefined;
  const statusFilter: MembershipStatus | undefined =
    params.status === "ACTIVE" ||
    params.status === "SUSPENDED" ||
    params.status === "EXPIRED"
      ? params.status
      : undefined;
  const query = (params.q ?? "").trim();

  const where = {
    ...(tierFilter ? { tier: tierFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { memberNumber: { contains: query, mode: "insensitive" as const } },
            { user: { name: { contains: query, mode: "insensitive" as const } } },
            { user: { email: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [memberships, counts] = await Promise.all([
    db.membership.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.membership.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const activeCount =
    counts.find((entry) => entry.status === "ACTIVE")?._count._all ?? 0;
  const suspendedCount =
    counts.find((entry) => entry.status === "SUSPENDED")?._count._all ?? 0;
  const expiredCount =
    counts.find((entry) => entry.status === "EXPIRED")?._count._all ?? 0;
  const totalCount = counts.reduce((sum, entry) => sum + entry._count._all, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Admin control panel
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Membership operations
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Issue cards, adjust credits, and audit every transaction and stay.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<Users className="h-4 w-4" />}
            label="Total members"
            value={String(totalCount)}
          />
          <StatTile
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Active"
            value={String(activeCount)}
          />
          <StatTile
            icon={<ShieldAlert className="h-4 w-4" />}
            label="Suspended"
            value={String(suspendedCount)}
          />
          <StatTile
            icon={<Crown className="h-4 w-4" />}
            label="Expired"
            value={String(expiredCount)}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
          <Card>
            <CardHeader>
              <CardTitle>Member directory</CardTitle>
              <CardDescription>
                Filter by tier or status, then open a member to audit their
                ledger and stays.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MemberDirectory
                members={memberships}
                filters={{
                  tier: params.tier,
                  status: params.status,
                  q: params.q,
                }}
              />
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Issue a membership card</CardTitle>
              <CardDescription>
                Manually enrol a walk-in member. The card activates immediately
                with their tier allowance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IssueCardForm />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>
              Every credit movement and reservation is logged against the member
              and the staff member who processed it. Open a member to review
              their full history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {memberships.length} membership
              {memberships.length === 1 ? "" : "s"} shown. Ledger entries and
              stays are available on each member&apos;s page.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
