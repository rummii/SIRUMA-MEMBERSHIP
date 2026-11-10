import Link from "next/link";
import { Waves, LayoutDashboard, ScanLine, ShieldCheck, LogIn } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "STAFF";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-sm">
            <Waves className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-wide text-slate-900">
              SIRUMA HIGHLANDS
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Beach Resort &amp; Leisure Club
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {session?.user ? (
            <>
              {role === "MEMBER" ? (
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  My portal
                </Link>
              ) : null}
              {isStaff ? (
                <Link
                  href="/desk"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ScanLine className="h-4 w-4" />
                  Front desk
                </Link>
              ) : null}
              {role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
              <Link href="/register">
                <Button size="sm">Become a member</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
