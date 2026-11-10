"use client";

import { useActionState } from "react";
import { adjustCreditAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export function CreditAdjustForm({
  membershipId,
  creditBalance,
}: {
  membershipId: string;
  creditBalance: number;
}) {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    adjustCreditAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="membershipId" value={membershipId} />
      <FormMessage error={state?.error} success={state?.success} />

      <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
        Current balance:{" "}
        <span className="font-semibold text-slate-900">
          {formatCurrency(creditBalance)}
        </span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Adjustment" htmlFor="adjust-type">
          <Select id="adjust-type" name="type" defaultValue="TOP_UP">
            <option value="TOP_UP">Top-up credits</option>
            <option value="REFUND">Refund</option>
            <option value="CREDIT_DEDUCTION">Manual deduction</option>
          </Select>
        </Field>
        <Field label="Amount (PHP)" htmlFor="adjust-amount">
          <Input
            id="adjust-amount"
            name="amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            required
          />
        </Field>
      </div>

      <Field label="Outlet" htmlFor="adjust-outlet">
        <Select id="adjust-outlet" name="outlet" defaultValue="RESTAURANT">
          <option value="RESTAURANT">Restaurant &amp; Bar</option>
          <option value="CABANA">Cabana rental</option>
          <option value="ACTIVITIES">Activities</option>
          <option value="ENTRANCE">Entrance fees</option>
          <option value="ROOM">Room charges</option>
        </Select>
      </Field>

      <Field label="Note" htmlFor="adjust-note">
        <Input
          id="adjust-note"
          name="note"
          placeholder="Reason for the adjustment"
          required
        />
      </Field>

      <div>
        <SubmitButton size="sm" pendingLabel="Recording…">
          Record adjustment
        </SubmitButton>
      </div>
    </form>
  );
}
