import { Crown, Palmtree, ShieldCheck, Star } from "lucide-react";

const ITEMS = [
  {
    icon: Palmtree,
    title: "Beach & highland access",
    text: "Member entrance with complimentary guests at every tier.",
  },
  {
    icon: Crown,
    title: "Priority reservations",
    text: "Book ahead of the public with 30 to 60-day windows.",
  },
  {
    icon: Star,
    title: "Resort credit wallet",
    text: "Dining, cabanas, gazebos, and activities on one balance.",
  },
  {
    icon: ShieldCheck,
    title: "Verified membership",
    text: "QR-secured digital cards verified at the front desk.",
  },
];

export function Benefits() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
