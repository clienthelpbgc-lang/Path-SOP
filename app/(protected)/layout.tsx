import { redirect } from "next/navigation";

import { AuthError } from "@/lib/errors";
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
      redirect("/login");
    }

    throw error;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
