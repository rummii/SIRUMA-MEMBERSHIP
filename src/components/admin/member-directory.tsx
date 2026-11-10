import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { STATUS_LABELS, TIER_LABELS } from "@/lib/membership";
import { formatDate, initials } from "@/lib/utils";

export type DirectoryRow = {
  id: string;
  memberNumber: string;
  tier: "PREMIUM" | "VIP";
  status: string;
  validUntil: Date;
  creditBalance: unknown;
  complimentaryStayQuota: number;
  complimentaryStayUsed: number;
  user: { name: string; email: string };
};

export function MemberDirectory({
  members,
  filters,
}: {
  members: DirectoryRow[];
  filters: { tier?: string; status?: string; q?: string };
}) {
  return (
    <div>
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-b border-slate-200 px-6 py-4"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-q"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Search
          </label>
          <input
            id="filter-q"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Name, email, or SHB number"
            className="h-9 w-56 rounded-lg border border-slate-300 px-3 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-tier"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Tier
          </label>
          <select
            id="filter-tier"
            name="tier"
            defaultValue={filters.tier ?? ""}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="">All tiers</option>
            <option value="PREMIUM">Premium</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-status"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Filter className="h-3.5 w-3.5" />
          Apply filters
        </button>
        <Link
          href="/admin"
          className="text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          Reset
        </Link>
      </form>

      {members.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">
          No members match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">Member No.</th>
                <th className="px-6 py-3 font-medium">Tier</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Free nights</th>
                <th className="px-6 py-3 font-medium">Valid until</th>
                <th className="px-6 py-3 text-right font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                        {initials(member.user.name)}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-700">
                    {member.memberNumber}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone="gold">{TIER_LABELS[member.tier]}</Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={statusTone(member.status)}>
                      {STATUS_LABELS[member.status] ?? member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {Math.max(
                      0,
                      member.complimentaryStayQuota -
                        member.complimentaryStayUsed,
                    )}{" "}
                    of {member.complimentaryStayQuota}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {formatDate(member.validUntil)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-slate-700"
                    >
                      Manage
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
