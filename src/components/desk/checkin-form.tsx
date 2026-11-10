"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { checkInAction, type FormState } from "@/app/actions/desk";
import type { VerifiedMember } from "@/app/actions/desk";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

export function CheckInForm({
  member,
  onClose,
  onCheckedIn,
}: {
  member: VerifiedMember;
  onClose: () => void;
  onCheckedIn: (nights: number, complimentary: boolean) => void;
}) {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    checkInAction,
    undefined,
  );
  const remaining = member.stayQuota - member.stayUsed;

  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById(
        "checkin-form",
      ) as HTMLFormElement | null;
      const nights = Number(form?.nights?.value ?? 1) || 1;
      const comp =
        (form?.isComplimentaryStay as HTMLInputElement | undefined)?.checked ??
        false;
      onCheckedIn(nights, comp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Validate arrival / check-in
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {member.name} · {member.memberNumber} · {member.tier}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="uppercase tracking-wide text-slate-400">Guest quota</p>
            <p className="mt-0.5 font-semibold text-slate-800">
              Member + {member.freeGuestQuota}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="uppercase tracking-wide text-slate-400">
              Complimentary nights
            </p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {remaining} of {member.stayQuota} remaining
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="uppercase tracking-wide text-slate-400">
              Flexible hours
            </p>
            <p className="mt-0.5 font-semibold text-slate-800">
              ±{member.checkinBufferHours} hour
              {member.checkinBufferHours === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="uppercase tracking-wide text-slate-400">
              Room discount
            </p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {Math.round(member.discountPercent * 100)}%
            </p>
          </div>
        </div>

        <form
          id="checkin-form"
          action={formAction}
          className="mt-4 flex flex-col gap-4"
        >
          <input type="hidden" name="membershipId" value={member.id} />
          <FormMessage error={state?.error} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nights" htmlFor="checkin-nights">
              <Input
                id="checkin-nights"
                name="nights"
                type="number"
                min="1"
                max="30"
                defaultValue={1}
                required
              />
            </Field>
            <Field label="Accompanying guests" htmlFor="checkin-guests">
              <Input
                id="checkin-guests"
                name="guestCount"
                type="number"
                min="0"
                max={member.freeGuestQuota}
                defaultValue={Math.min(2, member.freeGuestQuota)}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Early check-in (hours)" htmlFor="checkin-early">
              <Select
                id="checkin-early"
                name="earlyCheckinHours"
                defaultValue="0"
              >
                {Array.from(
                  { length: member.checkinBufferHours + 1 },
                  (_, hour) => (
                    <option key={hour} value={hour}>
                      {hour === 0 ? "None" : `+${hour} hour`}
                    </option>
                  ),
                )}
              </Select>
            </Field>
            <Field label="Late check-out (hours)" htmlFor="checkin-late">
              <Select
                id="checkin-late"
                name="lateCheckoutHours"
                defaultValue="0"
              >
                {Array.from(
                  { length: member.checkinBufferHours + 1 },
                  (_, hour) => (
                    <option key={hour} value={hour}>
                      {hour === 0 ? "None" : `+${hour} hour`}
                    </option>
                  ),
                )}
              </Select>
            </Field>
          </div>

          <Field label="Room upgrade" htmlFor="checkin-upgrade">
            <Select
              id="checkin-upgrade"
              name="upgradeStatus"
              defaultValue="NONE"
            >
              <option value="NONE">Standard room</option>
              <option value="PREFERRED_RATE">Preferred member rate</option>
              {member.tier === "VIP" ? (
                <option value="COMPLIMENTARY">Complimentary upgrade</option>
              ) : null}
            </Select>
          </Field>

          <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm">
            <input
              type="checkbox"
              name="isComplimentaryStay"
              className="mt-0.5 h-4 w-4 accent-slate-900"
            />
            <span>
              <span className="block font-medium text-slate-800">
                Redeem complimentary nights
              </span>
              <span className="block text-xs text-slate-500">
                {remaining} night{remaining === 1 ? "" : "s"} available on this
                membership.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <SubmitButton size="sm" pendingLabel="Checking in…">
              Check in member
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
