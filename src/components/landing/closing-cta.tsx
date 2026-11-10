import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 to-teal-950 px-8 py-12 text-center text-white shadow-xl sm:px-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your highland escape starts here
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-teal-100">
          Apply online in minutes. Once your payment is recorded by our
          membership team, your digital card activates instantly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-300">
              Start your application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/5 text-white hover:bg-white/10"
            >
              Member sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
