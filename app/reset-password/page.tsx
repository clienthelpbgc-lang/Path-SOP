import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { BackToLoginLink } from "@/components/auth/back-to-login-link";
import { FormAlert } from "@/components/auth/form-alert";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset password",
  // The URL carries a one-time token; keep it out of Referer headers.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token_hash: tokenHash } = await searchParams;

  if (typeof tokenHash !== "string" || tokenHash.length === 0) {
    return (
      <AuthPageShell
        eyebrow="Reset password"
        title="Link not valid"
        footer={<BackToLoginLink />}
      >
        <div className="flex flex-col gap-5">
          <FormAlert tone="error">
            This reset link is incomplete or invalid. Please request a new
            one.
          </FormAlert>
          <Button
            render={<Link href="/forgot-password" />}
            nativeButton={false}
            size="lg"
            className="h-10 w-full"
          >
            Request a new link
          </Button>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      eyebrow="Almost there"
      title="Choose a new password"
      footer={<BackToLoginLink />}
    >
      <ResetPasswordForm tokenHash={tokenHash} />
    </AuthPageShell>
  );
}
