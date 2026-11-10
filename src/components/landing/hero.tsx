import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.35),_transparent_60%)]" />
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
            <Sparkles className="h-3.5 w-3.5" />
            Membership 2026
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The highlands meet
            <span className="block bg-gradient-to-r from-teal-200 via-amber-200 to-teal-200 bg-clip-text text-transparent">
              the open sea.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Join Siruma Highlands Beach Resort &amp; Leisure Club and unlock
            year-round escapes — discounted stays, complimentary nights, a resort
            credit wallet, and priority access to the coast.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-300">
                Apply for membership
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#tiers">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Compare tiers
              </Button>
            </Link>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              ["2", "Membership tiers"],
              ["365", "Days of member access"],
              ["₱20k", "Starting credit wallet"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-bold text-amber-200">{value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-200">
                <Waves className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Digital member card
                </span>
              </div>
              <BadgeCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 p-5 ring-1 ring-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300">
                    Siruma Highlands
                  </p>
                  <p className="text-sm font-semibold">Maria Santillan</p>
                </div>
                <span className="rounded-full bg-slate-300/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 ring-1 ring-slate-300/30">
                  Premium
                </span>
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Member No.
                  </p>
                  <p className="font-mono text-sm font-semibold text-amber-200">
                    SHB-00001
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-slate-400">
                    Valid until
                  </p>
                  <p className="text-xs font-semibold">31 Dec 2026</p>
                </div>
                <div className="grid h-20 w-20 grid-cols-4 gap-0.5 rounded-lg bg-white p-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        [0, 1, 2, 4, 5, 7, 8, 9, 11, 13, 14, 15].includes(i)
                          ? "rounded-[1px] bg-slate-900"
                          : "rounded-[1px] bg-white"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
              {[
                "Scan-to-verify at the front desk",
                "Live credit wallet & free-night tracker",
                "Instant guest allowances per tier",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
