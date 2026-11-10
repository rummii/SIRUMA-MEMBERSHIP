import Link from "next/link";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
        <Waves className="h-7 w-7 text-teal-200" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        This trail leads nowhere
      </h1>
      <p className="mt-3 max-w-md text-slate-400">
        The page you are looking for does not exist or has been moved. Head back
        to the clubhouse.
      </p>
      <Link href="/" className="mt-8">
        <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300">
          Back to the homepage
        </Button>
      </Link>
    </div>
  );
}
