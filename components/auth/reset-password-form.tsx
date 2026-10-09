"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import {
  resetPasswordAction,
  type ResetPasswordFormState,
} from "@/features/auth/password-reset.actions";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialState: ResetPasswordFormState = undefined;

export function ResetPasswordForm({ tokenHash }: { tokenHash: string }) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const passwordError = state?.fieldErrors?.password?.[0];
  const confirmError = state?.fieldErrors?.confirmPassword?.[0];

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <input type="hidden" name="tokenHash" value={tokenHash} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter a new password"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
          withIcon
          className="h-10"
          aria-invalid={!!passwordError}
          aria-describedby="password-hint"
        />
        {passwordError ? (
          <p className="text-xs text-destructive">{passwordError}</p>
        ) : (
          <p id="password-hint" className="text-xs text-muted-foreground">
            At least 8 characters, including a letter and a number.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter the new password"
          required
          autoComplete="new-password"
          withIcon
          className="h-10"
          aria-invalid={!!confirmError}
        />
        {confirmError && (
          <p className="text-xs text-destructive">{confirmError}</p>
        )}
      </div>

      {state?.error && (
        <FormAlert tone="error">
          {state.error}{" "}
          <Link
            href="/forgot-password"
            className="font-medium underline underline-offset-4"
          >
            Request a new link
          </Link>
        </FormAlert>
      )}

      <Button type="submit" disabled={pending} size="lg" className="h-10 w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
}
