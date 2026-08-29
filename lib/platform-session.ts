import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";

import { systemDb } from "@/db";
import { platformAdmins } from "@/features/platform-admin/schema";
import type { PlatformAdmin } from "@/features/platform-admin/types";
import { AuthError } from "@/lib/errors";
import { createClient } from "@/utils/supabase/server";

// Platform admins are not tenant users -- no companyId, no RLS. Resolved
// straight off systemDb (the privileged, non-RLS role), never through the
// tenant-scoped `db` proxy in db/tenant-context.ts. See
// features/platform-admin/schema.ts for why that's safe.
export const getCurrentPlatformAdmin = cache(async (): Promise<PlatformAdmin> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new AuthError("Please login first.");
  }

  const [admin] = await systemDb
    .select()
    .from(platformAdmins)
    .where(eq(platformAdmins.id, authUser.id))
    .limit(1);

  if (!admin || !admin.isActive) {
    throw new AuthError("Your account could not be found.");
  }

  return admin;
});
