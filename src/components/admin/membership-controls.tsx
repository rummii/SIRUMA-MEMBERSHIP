"use client";

import { useActionState } from "react";
import {
  extendMembershipAction,
  setMembershipStatusAction,
} from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { STATUS_LABELS } from "@/lib/membership";

const STATUSES = ["ACTIVE", "SUSPENDED", "EXPIRED"];

export function MembershipControls({
  membershipId,
  status,
}: {
  membershipId: string;
  status: string;
}) {
  const [statusState, statusAction] = useActionState<
    FormState | undefined,
    FormData
  >(setMembershipStatusAction, undefined);

  const [renewState, renewAction] = useActionState<
    FormState | undefined,
    FormData
  >(extendMembershipAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <form action={statusAction} className="flex flex-col gap-3">
        <input type="hidden" name="membershipId" value={membershipId} />
        <FormMessage error={statusState?.error} success={statusState?.success} />
        <Field label="Membership status" htmlFor="membership-status">
          <Select id="membership-status" name="status" defaultValue={status}>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value] ?? value}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <SubmitButton size="sm" variant="outline" pendingLabel="Updating…">
            Update status
          </SubmitButton>
        </div>
      </form>

      <form
        action={renewAction}
        className="flex flex-col gap-3 border-t border-slate-200 pt-5"
      >
        <input type="hidden" name="membershipId" value={membershipId} />
        <FormMessage error={renewState?.error} success={renewState?.success} />
        <Field label="Renew membership" htmlFor="renew-years">
          <Select id="renew-years" name="years" defaultValue="1">
            <option value="1">+1 year</option>
            <option value="2">+2 years</option>
            <option value="3">+3 years</option>
          </Select>
        </Field>
        <div>
          <SubmitButton size="sm" variant="outline" pendingLabel="Renewing…">
            Extend validity
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
