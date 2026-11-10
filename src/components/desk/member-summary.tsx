"use client";

import {
  ArrowRightLeft,
  CalendarClock,
  Crown,
  Percent,
  Users,
} from "lucide-react";
import type { VerifiedMember } from "@/app/actions/desk";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABELS, TRANSACTION_LABELS } from "@/lib/membership";
import { formatCurrency, formatDate, initials } from "@/lib/utils";

export function MemberSummary({
  member,
  onDeduct,
  onCheckIn,
}: {
  member: VerifiedMember;
  onDeduct: () => void;
  onCheckIn: () => void;
}) {
  const remaining = member.stayQuota - member.stayUsed;
  const active = member.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              {initials(member.name)}
            </span>
            <div>
              <CardTitle className="text-xl">{member.name}</CardTitle>
              <p className="font-mono text-xs font-semibold text-slate-500">
                {member.memberNumber}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge tone={statusTone(member.status)}>
              {STATUS_LABELS[member.status] ?? member.status}
            </Badge>
            <Badge tone="gold">
              <Crown className="h-3 w-3" />
              {member.tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <Detail
              icon={<ArrowRightLeft className="h-3.5 w-3.5" />}
              label="Credit balance"
              value={formatCurrency(member.creditBalance)}
            />
            <Detail
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              label="Free nights left"
              value={`${remaining} of ${member.stayQuota}`}
            />
            <Detail
              icon={<Users className="h-3.5 w-3.5" />}
              label="Guest allowance"
              value={`+${member.freeGuestQuota}`}
            />
            <Detail
              icon={<Percent className="h-3.5 w-3.5" />}
              label="Room discount"
              value={`${Math.round(member.discountPercent * 100)}%`}
            />
            <Detail
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              label="Booking window"
              value={`${member.advanceBookingDays} days`}
            />
            <Detail
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              label="Flexible hours"
              value={`±${member.checkinBufferHours}h`}
            />
          </dl>

          <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:grid-cols-2">
            <p>
              <span className="uppercase tracking-wide text-slate-400">
                Valid until{" "}
              </span>
              <span className="font-semibold text-slate-700">
                {formatDate(member.validUntil)}
              </span>
            </p>
            <p>
              <span className="uppercase tracking-wide text-slate-400">
                Contact{" "}
              </span>
              <span className="font-semibold text-slate-700">
                {member.phone ?? member.email}
              </span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onDeduct}
              disabled={!active || member.creditBalance <= 0}
            >
              Deduct credits
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCheckIn}
              disabled={!active}
            >
              Validate check-in
            </Button>
          </div>
          {!active ? (
            <p className="mt-2 text-xs font-medium text-rose-600">
              Membership is {member.status.toLowerCase()} — privileges are
              locked until reactivated by an administrator.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent ledger activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {member.transactions.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">
              No ledger entries yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {member.transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 px-6 py-3 text-sm"
                >
                  <span>
                    <span className="block font-medium text-slate-800">
                      {TRANSACTION_LABELS[transaction.type] ??
                        transaction.type}{" "}
                      · {transaction.outletLabel}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {transaction.note} · {formatDate(transaction.createdAt)}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-semibold text-slate-700">
                    {transaction.type === "CREDIT_DEDUCTION" ? "−" : "+"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
