import { Route } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary-foreground),transparent_88%),transparent_45%),radial-gradient(circle_at_80%_75%,color-mix(in_oklch,var(--primary-foreground),transparent_92%),transparent_50%)]"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
            <Route className="size-5" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Path SOP
          </span>
        </div>

        <div className="relative flex flex-col gap-4">
          <h1 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
            Keep every process on track, every time.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            Standardize your team&apos;s daily workflows, follow SOPs step by
            step, and stay accountable with a single source of truth.
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Path SOP. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-8 p-6 lg:w-1/2">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Route className="size-5" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Path SOP
          </span>
        </div>

        <Card className="w-full max-w-sm ring-foreground/10">
          <CardContent className="flex flex-col gap-6 px-6 py-2">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <LoginForm />
          </CardContent>
        </Card>

        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Need access? Contact your company administrator to get an account
          set up.
        </p>
      </div>
    </main>
  );
}
