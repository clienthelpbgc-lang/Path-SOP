import { LoginForm } from "@/app/login/login-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormAlert } from "@/components/auth/form-alert";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { reset } = await searchParams;

  return (
    <AuthPageShell
      eyebrow="Please enter your details"
      title="Welcome back"
      footer={
        <p>
          Need access? Contact your company administrator to get an account
          set up.
        </p>
      }
    >
      {reset === "success" && (
        <div className="pb-5">
          <FormAlert tone="success">
            Your password has been reset. Sign in with your new password.
          </FormAlert>
        </div>
      )}

      <LoginForm />
    </AuthPageShell>
  );
}
