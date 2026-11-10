import Link from "next/link";
import { Waves } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.4),_transparent_65%)]" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Waves className="h-5 w-5 text-teal-200" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-wide">
              SIRUMA HIGHLANDS
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Beach Resort &amp; Leisure Club
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            Members portal
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
            Your key to the highlands and the sea.
          </h1>
          <p className="mt-4 text-slate-300">
            Manage your membership card, track your resort credits, and review
            your payment history — all in one place.
          </p>
        </div>

        <p className="relative text-xs uppercase tracking-[0.2em] text-slate-500">
          Camarines Sur · Philippines
        </p>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
