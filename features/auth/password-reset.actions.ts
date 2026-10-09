"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import { requestPasswordReset } from "@/features/auth/service/request-password-reset.service";
import { resetPassword } from "@/features/auth/service/reset-password.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/validation";
import { getClientIpFromHeaders } from "@/lib/rate-limit/get-client-ip";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-rate-limiter";

const FIFTEEN_MINUTES_MS = 15 * 60_000;
const ONE_HOUR_MS = 60 * 60_000;

export type ForgotPasswordFormState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; error: string };

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return { status: "error", error: "Please enter a valid email address." };
  }

  const { email } = result.data;
  const ip = getClientIpFromHeaders(await headers());

  if (!checkRateLimit(`forgot-password:ip:${ip}`, 10, FIFTEEN_MINUTES_MS).allowed) {
    return {
      status: "error",
      error: "Too many reset requests. Please wait a few minutes and try again.",
    };
  }

  // Throttled silently per email: telling the requester would reveal that
  // the account exists, and the victim's inbox is protected either way.
  if (checkRateLimit(`forgot-password:email:${email}`, 3, ONE_HOUR_MS).allowed) {
    // Runs after the response is sent, so the response time (and outcome)
    // is the same whether or not the account exists.
    after(async () => {
      try {
        await requestPasswordReset(email);
      } catch (error) {
        console.error("Failed to send password reset email.", error);
      }
    });
  }

  return { status: "sent", email };
}

export type ResetPasswordFormState =
  | undefined
  | {
      error?: string;
      fieldErrors?: Partial<Record<"password" | "confirmPassword", string[]>>;
    };

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const result = resetPasswordSchema.safeParse({
    tokenHash: formData.get("tokenHash"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;

    return fieldErrors.tokenHash
      ? { error: fieldErrors.tokenHash[0] }
      : {
          fieldErrors: {
            password: fieldErrors.password,
            confirmPassword: fieldErrors.confirmPassword,
          },
        };
  }

  const ip = getClientIpFromHeaders(await headers());

  if (!checkRateLimit(`reset-password:ip:${ip}`, 10, FIFTEEN_MINUTES_MS).allowed) {
    return {
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const outcome = await resetPassword(result.data.tokenHash, result.data.password);

  if (!outcome.ok) {
    return { error: outcome.error };
  }

  redirect("/login?reset=success");
}
