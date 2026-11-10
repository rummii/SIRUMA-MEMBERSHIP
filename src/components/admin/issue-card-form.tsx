"use client";

import { useActionState } from "react";
import { issueMembershipAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

export function IssueCardForm() {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    issueMembershipAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} success={state?.success} />

      <Field label="Full name" htmlFor="issue-name">
        <Input id="issue-name" name="name" placeholder="Juan Dela Cruz" required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="issue-email">
          <Input
            id="issue-email"
            name="email"
            type="email"
            placeholder="juan@example.com"
            required
          />
        </Field>
        <Field label="Mobile (optional)" htmlFor="issue-phone">
          <Input id="issue-phone" name="phone" placeholder="+63 917 000 0000" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tier" htmlFor="issue-tier">
          <Select id="issue-tier" name="tier" defaultValue="PREMIUM">
            <option value="PREMIUM">Premium — ₱100,000</option>
            <option value="VIP">VIP — ₱150,000</option>
          </Select>
        </Field>
        <Field
          label="Temporary password"
          htmlFor="issue-password"
          hint="At least 8 characters; share with the member."
        >
          <Input
            id="issue-password"
            name="password"
            type="text"
            placeholder="Temp-Pass-2026"
            required
          />
        </Field>
      </div>

      <div>
        <SubmitButton size="sm" pendingLabel="Issuing card…">
          Issue membership card
        </SubmitButton>
      </div>
    </form>
  );
}
