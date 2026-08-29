import { redirect } from "next/navigation";

import { AuthError } from "@/lib/errors";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";
import { PlatformShell } from "@/components/layout/platform-shell";

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;

  try {
    admin = await getCurrentPlatformAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }

    throw error;
  }

  return <PlatformShell admin={admin}>{children}</PlatformShell>;
}
