import Image from "next/image";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

// Branded, centered card layout shared by every signed-out page (login,
// forgot password, reset password).
export function AuthPageShell({
  eyebrow,
  title,
  children,
  footer,
}: AuthPageShellProps) {
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
              <p className="text-sm text-muted-foreground">{eyebrow}</p>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                {title}
              </h1>
            </div>

            {children}

            {footer && (
              <div className="mt-6 text-center text-xs text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
