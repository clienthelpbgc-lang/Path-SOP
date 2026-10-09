"use client";

import { useActionState } from "react";
import { Loader2, Mail, MailCheck } from "lucide-react";

import {
  requestPasswordResetAction,
  type ForgotPasswordFormState,
} from "@/features/auth/password-reset.actions";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ForgotPasswordFormState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <p className="text-sm text-foreground">
          If an account exists for{" "}
          <span className="font-medium break-all">{state.email}</span>, you&apos;ll
          receive an email with a link to reset your password shortly.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t get it? Check your spam folder, or contact your company
          administrator.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
            autoFocus
            className="h-10 pl-9"
          />
        </div>
      </div>

      {state.status === "error" && (
        <FormAlert tone="error">{state.error}</FormAlert>
      )}

      <Button type="submit" disabled={pending} size="lg" className="h-10 w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
