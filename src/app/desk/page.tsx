import { redirect } from "next/navigation";
import { ScanLine, Search } from "lucide-react";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { DeskConsole } from "@/components/desk/desk-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "Front desk" };

export default async function DeskPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/portal");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Front desk terminal
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <ScanLine className="h-6 w-6 text-slate-700" />
            Member verification
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Scan a member QR card or look up an SHB number to verify privileges.
          </p>
        </div>

        <DeskConsole />
      </main>
    </div>
  );
}

