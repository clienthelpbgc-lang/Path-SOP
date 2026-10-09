import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { BackToLoginLink } from "@/components/auth/back-to-login-link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Enter the email you sign in with"
      title="Forgot your password?"
      footer={<BackToLoginLink />}
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
