import Link from "next/link";
import { Check, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIER_CONFIG, TIER_ORDER } from "@/lib/tiers";
import { formatCurrency } from "@/lib/utils";

export function Plans() {
  return (
    <section id="tiers" className="border-y border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Membership tiers
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Two tiers. One highland home.
          </h2>
          <p className="mt-4 text-slate-500">
            Premium and VIP memberships both include a digital card, front-desk
            guest privileges, and year-round member rates.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            const isVip = tier === "VIP";
            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-3xl border bg-white p-7 shadow-sm ${
                  isVip
                    ? "border-slate-900 shadow-lg shadow-slate-900/10"
                    : "border-slate-200"
                }`}
              >
                {isVip ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    First priority
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                      isVip
                        ? "bg-gradient-to-br from-amber-500 to-amber-700"
                        : "bg-gradient-to-br from-slate-600 to-slate-800"
                    }`}
                  >
                    {isVip ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <Gem className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {config.label}
                    </h3>
                    <p className="text-xs text-slate-500">{config.tagline}</p>
                  </div>
                </div>

                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(config.fee)}
                  </span>
                  <span className="text-sm text-slate-500">/ year</span>
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {Math.round(config.discountPercent * 100)}% off room rates ·{" "}
                  {config.complimentaryStays} free nights ·{" "}
                  {formatCurrency(config.creditBalance)} credits
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-600">
                  {config.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-800" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/register?tier=${tier}`} className="mt-7">
                  <Button
                    className="w-full"
                    variant={isVip ? "primary" : "outline"}
                  >
                    Join {config.label}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
