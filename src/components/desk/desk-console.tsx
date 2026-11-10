"use client";

import { useActionState, useRef, useState } from "react";
import { IdCard, ScanLine } from "lucide-react";
import {
  verifyMemberAction,
  type VerifiedMember,
  type VerifyState,
} from "@/app/actions/desk";
import { QrScanner } from "@/components/desk/qr-scanner";
import { MemberSummary } from "@/components/desk/member-summary";
import { DeductionModal } from "@/components/desk/deduction-modal";
import { CheckInForm } from "@/components/desk/checkin-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DeskConsole() {
  const [verifyState, verifyAction] = useActionState<
    VerifyState | undefined,
    FormData
  >(verifyMemberAction, undefined);
  const [code, setCode] = useState("");
  const [override, setOverride] = useState<{
    source: VerifyState | undefined;
    member: VerifiedMember;
  } | null>(null);
  const [bannerState, setBannerState] = useState<{
    source: VerifyState | undefined;
    text: string;
  } | null>(null);
  const [deductOpen, setDeductOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // The member view is derived from the latest verification result, with an
  // optional local override for optimistic updates after deductions/check-ins.
  const member =
    override && override.source === verifyState
      ? override.member
      : (verifyState?.member ?? null);
  const banner =
    bannerState && bannerState.source === verifyState ? bannerState.text : null;

  function handleScan(text: string) {
    setCode(text);
    window.setTimeout(() => formRef.current?.requestSubmit(), 50);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verify a member</CardTitle>
            <CardDescription>
              Scan the QR card or type the member&apos;s SHB number.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form ref={formRef} action={verifyAction} className="flex flex-col gap-3">
              <label
                htmlFor="verify-code"
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                <IdCard className="h-3.5 w-3.5" />
                Member code
              </label>
              <Input
                id="verify-code"
                name="code"
                placeholder='SHB-00001 or scanned QR payload'
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
                required
              />
              <SubmitButton size="sm" pendingLabel="Verifying…">
                <ScanLine className="h-4 w-4" />
                Verify member
              </SubmitButton>
              <FormMessage error={verifyState?.error} />
            </form>

            <QrScanner onResult={handleScan} />
          </CardContent>
        </Card>

        {banner ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {banner}
          </div>
        ) : null}
      </div>

      <div>
        {member ? (
          <MemberSummary
            member={member}
            onDeduct={() => setDeductOpen(true)}
            onCheckIn={() => setCheckinOpen(true)}
          />
        ) : (
          <Card className="h-full">
            <CardContent className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ScanLine className="h-7 w-7" />
              </span>
              <p className="text-sm font-medium text-slate-700">
                No member verified yet
              </p>
              <p className="max-w-xs text-xs text-slate-400">
                Once a card is scanned, tier, validity, credit balance, and
                quotas will appear here for front-desk checks.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {deductOpen && member ? (
        <DeductionModal
          member={member}
          onClose={() => setDeductOpen(false)}
          onDeducted={(amount) => {
            if (member) {
              setOverride({
                source: verifyState,
                member: {
                  ...member,
                  creditBalance: Math.max(0, member.creditBalance - amount),
                },
              });
              setBannerState({
                source: verifyState,
                text: `Deducted ₱${amount.toLocaleString(
                  "en-PH",
                )} from ${member.memberNumber}.`,
              });
            }
            setDeductOpen(false);
          }}
        />
      ) : null}

      {checkinOpen && member ? (
        <CheckInForm
          member={member}
          onClose={() => setCheckinOpen(false)}
          onCheckedIn={(nights, complimentary) => {
            if (member) {
              setOverride({
                source: verifyState,
                member: {
                  ...member,
                  stayUsed: complimentary
                    ? member.stayUsed + nights
                    : member.stayUsed,
                },
              });
              setBannerState({
                source: verifyState,
                text: `Checked in ${member.memberNumber} for ${nights} night${
                  nights === 1 ? "" : "s"
                }${complimentary ? " (complimentary)" : ""}.`,
              });
            }
            setCheckinOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
