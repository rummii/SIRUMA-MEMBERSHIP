import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/landing/hero";
import { Benefits } from "@/components/landing/benefits";
import { Plans } from "@/components/landing/plans";
import { ClosingCta } from "@/components/landing/closing-cta";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Benefits />
        <Plans />
        <ClosingCta />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} Siruma Highlands Beach Resort &amp;
            Leisure Club
          </p>
          <p className="text-xs uppercase tracking-wider">
            Camarines Sur · Philippines
          </p>
        </div>
      </footer>
    </div>
  );
}

