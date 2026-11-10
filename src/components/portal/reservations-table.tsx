import type { Reservation } from "@prisma/client";
import { CalendarDays } from "lucide-react";
import {
  RESERVATION_LABELS,
  UPGRADE_LABELS,
  nightsBetween,
} from "@/lib/membership";
import { formatDate } from "@/lib/utils";

const STATUS_TONES: Record<string, string> = {
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  CHECKED_IN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function ReservationsTable({
  reservations,
}: {
  reservations: Reservation[];
}) {
  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <CalendarDays className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-600">No stays yet</p>
        <p className="max-w-xs text-xs text-slate-400">
          Your reservations and check-ins will appear here after your first visit.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-6 py-3 font-medium">Stay</th>
            <th className="px-6 py-3 font-medium">Nights</th>
            <th className="px-6 py-3 font-medium">Guests</th>
            <th className="px-6 py-3 font-medium">Privileges</th>
            <th className="px-6 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr
              key={reservation.id}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="whitespace-nowrap px-6 py-3.5 text-slate-700">
                {formatDate(reservation.checkIn)} →{" "}
                {formatDate(reservation.checkOut)}
              </td>
              <td className="px-6 py-3.5 text-slate-600">
                {nightsBetween(reservation.checkIn, reservation.checkOut)}
              </td>
              <td className="px-6 py-3.5 text-slate-600">
                Member + {reservation.guestCount}
              </td>
              <td className="px-6 py-3.5 text-slate-600">
                <span className="block text-xs">
                  {Math.round(Number(reservation.discountApplied) * 100)}% room
                  discount
                </span>
                <span className="block text-xs text-slate-400">
                  {UPGRADE_LABELS[reservation.upgradeStatus] ??
                    reservation.upgradeStatus}
                  {reservation.isComplimentaryStay ? " · complimentary stay" : ""}
                </span>
                <span className="block text-xs text-slate-400">
                  +{reservation.earlyCheckinHours}h early / +
                  {reservation.lateCheckoutHours}h late
                </span>
              </td>
              <td className="px-6 py-3.5">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    STATUS_TONES[reservation.status] ??
                    "bg-slate-100 text-slate-700 ring-slate-200"
                  }`}
                >
                  {RESERVATION_LABELS[reservation.status] ?? reservation.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
