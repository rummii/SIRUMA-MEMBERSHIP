"use client";

import { QRCodeSVG } from "qrcode.react";
import { Crown, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { buildQrPayload } from "@/lib/qr";
import { formatDate } from "@/lib/utils";

type MembershipCardProps = {
  memberName: string;
  memberNumber: string;
  tier: "PREMIUM" | "VIP";
  status: string;
  validUntil: string;
  qrToken: string;
};

export function MembershipCard({
  memberName,
  memberNumber,
  tier,
  status,
  validUntil,
  qrToken,
}: MembershipCardProps) {
  const qrPayload = buildQrPayload(memberNumber, qrToken);
  const isVip = tier === "VIP";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 p-1 shadow-xl ring-1 ring-slate-300/70">
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div
          className={`pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full blur-3xl ${
            isVip ? "bg-amber-400/25" : "bg-slate-400/20"
          }`}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-300">
              Siruma Highlands
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Beach Resort &amp; Leisure Club
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
              isVip
                ? "bg-amber-400/15 text-amber-200 ring-amber-300/40"
                : "bg-slate-300/15 text-slate-200 ring-slate-300/30"
            }`}
          >
            <Crown className="h-3 w-3" />
            {isVip ? "VIP" : "Premium"}
          </span>
        </div>

        <div className="relative mt-7 flex items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Member
            </p>
            <p className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {memberName}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-xs">
              <div>
                <dt className="uppercase tracking-wider text-slate-400">
                  Member No.
                </dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-100">
                  {memberNumber}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-slate-400">
                  Expires
                </dt>
                <dd className="mt-0.5 text-sm font-semibold">
                  {formatDate(validUntil)}
                </dd>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Camarines Sur, Philippines
              </div>
            </dl>
          </div>

          <div className="shrink-0 rounded-2xl bg-white p-2.5 shadow-lg">
            <QRCodeSVG
              value={qrPayload}
              size={104}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f172a"
              marginSize={0}
              title={`Siruma membership QR for ${memberNumber}`}
            />
          </div>
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Present this card at the front desk
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-semibold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            {status.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
