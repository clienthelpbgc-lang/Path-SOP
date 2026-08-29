import { redirect } from "next/navigation";

import { AuthError } from "@/lib/errors";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";
import { getCurrentUser } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;

  try {
    user = await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthError) {
      // Not a tenant user -- could still be a platform admin (no row in
      // `users` at all), who belongs on their own dashboard rather than
      // bounced to /login (they do have a valid session, so proxy.ts would
      // just bounce them straight back here, looping).
      const isPlatformAdmin = await getCurrentPlatformAdmin()
        .then(() => true)
        .catch(() => false);

      redirect(isPlatformAdmin ? "/platform-admin" : "/login");
    }

    throw error;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
