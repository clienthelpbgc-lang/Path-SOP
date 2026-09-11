import Image from "next/image";

import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-muted/40 px-6 py-8">
      <div className="flex items-center">
        <Image
          src="/bgc-logo.png"
          alt="Business Growth Consultancy"
          width={1721}
          height={366}
          className="h-8 w-auto"
          priority
        />
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="flex w-full max-w-sm flex-col items-center">
          <Image
            src="/pathsop-logo.png"
            alt="Path SOP"
            width={714}
            height={500}
            className="mb-6 h-30 w-auto"
            priority
          />

          <div className="w-full rounded-2xl border bg-background p-8 shadow-sm">
            <div className="flex flex-col gap-1.5 pb-6">
              <p className="text-sm text-muted-foreground">
                Please enter your details
              </p>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Welcome back
              </h1>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Need access? Contact your company administrator to get an
              account set up.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
