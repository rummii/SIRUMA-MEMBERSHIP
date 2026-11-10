"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ registered }: { registered?: boolean }) {
  const [state, formAction] = useActionState<FormState | undefined, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Sign in to access your membership card and account.
        </p>
      </div>

      {registered ? (
        <FormMessage success="Application received. Sign in once your payment has been recorded." />
      ) : null}
      <FormMessage error={state?.error} />

      <Field label="Email address" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>

      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        Not a member yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-teal-700 hover:text-teal-800"
        >
          Apply for membership
        </Link>
      </p>
    </form>
  );
}
