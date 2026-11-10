"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/member";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ProfileFormProps = {
  name: string;
  email: string;
  phone: string | null;
};

export function ProfileForm({ name, email, phone }: ProfileFormProps) {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    updateProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} success={state?.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="profile-name">
          <Input id="profile-name" name="name" defaultValue={name} required />
          {state?.fieldErrors?.name ? (
            <p className="text-xs text-rose-600">{state.fieldErrors.name}</p>
          ) : null}
        </Field>
        <Field
          label="Email address"
          htmlFor="profile-email"
          hint="Contact the front desk to change your email."
        >
          <Input id="profile-email" defaultValue={email} disabled />
        </Field>
        <Field label="Mobile number" htmlFor="profile-phone">
          <Input
            id="profile-phone"
            name="phone"
            defaultValue={phone ?? ""}
            placeholder="+63 917 000 0000"
          />
        </Field>
      </div>

      <div>
        <SubmitButton size="sm" pendingLabel="Saving…">
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}
