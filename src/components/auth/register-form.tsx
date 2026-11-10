"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TIER_CONFIG, TIER_ORDER } from "@/lib/tiers";
import { formatCurrency } from "@/lib/utils";
import { registerAction, type FormState } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function RegisterForm({ defaultTier = "PREMIUM" }: { defaultTier?: string }) {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    registerAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Apply for membership
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Choose your tier and create your member account.
        </p>
      </div>

      <FormMessage error={state?.error} success={state?.success} />

      <Field label="Full name" htmlFor="name">
        <Input id="name" name="name" placeholder="Ana Marie Reyes" required />
        {state?.fieldErrors?.name ? (
          <p className="text-xs text-rose-600">{state.fieldErrors.name}</p>
        ) : null}
      </Field>

      <Field label="Email address" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        {state?.fieldErrors?.email ? (
          <p className="text-xs text-rose-600">{state.fieldErrors.email}</p>
        ) : null}
      </Field>

      <Field label="Mobile number (optional)" htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          placeholder="+63 917 000 0000"
          autoComplete="tel"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
          />
          {state?.fieldErrors?.password ? (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            required
          />
          {state?.fieldErrors?.confirmPassword ? (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-700">
          Membership tier
        </legend>
        <div className="grid gap-2">
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            return (
              <label
                key={tier}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm transition has-[:checked]:border-slate-800 has-[:checked]:bg-slate-50 has-[:checked]:ring-2 has-[:checked]:ring-slate-800/15"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tier"
                    value={tier}
                    defaultChecked={tier === defaultTier}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">
                      {config.label}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {Math.round(config.discountPercent * 100)}% room discount ·{" "}
                      {config.complimentaryStays} free nights · +
                      {config.freeGuests} guests
                    </span>
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-slate-900">
                  {formatCurrency(config.fee)}
                </span>
              </label>
            );
          })}
        </div>
        {state?.fieldErrors?.tier ? (
          <p className="text-xs text-rose-600">{state.fieldErrors.tier}</p>
        ) : null}
      </fieldset>

      <SubmitButton pendingLabel="Submitting application…" className="w-full">
        Create my account
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        Already a member?{" "}
        <Link
          href="/login"
          className="font-semibold text-slate-900 hover:text-slate-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
