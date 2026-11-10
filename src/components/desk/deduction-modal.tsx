"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { deductCreditAction } from "@/app/actions/desk";
import type { FormState } from "@/app/actions/desk";
import type { VerifiedMember } from "@/app/actions/desk";
import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export function DeductionModal({
  member,
  onClose,
  onDeducted,
}: {
  member: VerifiedMember;
  onClose: () => void;
  onDeducted: (amount: number) => void;
}) {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    deductCreditAction,
    undefined,
  );
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (state?.success) {
      const parsed = Number(amount);
      if (Number.isFinite(parsed) && parsed > 0) onDeducted(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Deduct privilege credits
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {member.name} · {member.memberNumber}
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

        <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
          Available balance:{" "}
          <span className="font-semibold text-slate-900">
            {formatCurrency(member.creditBalance)}
          </span>
        </p>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="membershipId" value={member.id} />
          <FormMessage error={state?.error} />

          <Field label="Amount (PHP)" htmlFor="deduct-amount">
            <Input
              id="deduct-amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </Field>

          <Field label="Outlet" htmlFor="deduct-outlet">
            <Select id="deduct-outlet" name="outlet" defaultValue="RESTAURANT">
              <option value="RESTAURANT">Restaurant &amp; Bar</option>
              <option value="CABANA">Cabana rental</option>
              <option value="ACTIVITIES">Activities</option>
              <option value="ENTRANCE">Entrance fees</option>
              <option value="ROOM">Room charges</option>
            </Select>
          </Field>

          <Field label="Note" htmlFor="deduct-note">
            <Input
              id="deduct-note"
              name="note"
              placeholder="e.g. Dinner for 4, gazebo rental"
              required
            />
          </Field>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <SubmitButton size="sm" pendingLabel="Deducting…">
              Confirm deduction
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
