import { eq } from "drizzle-orm";

import { systemDb } from "@/db";
import { platformAdmins } from "@/features/platform-admin/schema";
import { users } from "@/features/user/schema";

type PasswordResetRecipient = { name: string };

// Runs before anyone is signed in, so there's no tenant scope to query
// through -- systemDb is the only option, and the lookup is by the exact
// email the requester already typed in. Deactivated accounts get nothing:
// a reset must not become a way back into an account an admin turned off.
export async function findPasswordResetRecipient(
  email: string,
): Promise<PasswordResetRecipient | null> {
  const [tenantUser] = await systemDb
    .select({ name: users.name, isActive: users.isActive })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (tenantUser) {
    return tenantUser.isActive ? { name: tenantUser.name } : null;
  }

  const [platformAdmin] = await systemDb
    .select({ name: platformAdmins.name, isActive: platformAdmins.isActive })
    .from(platformAdmins)
    .where(eq(platformAdmins.email, email))
    .limit(1);

  if (platformAdmin) {
    return platformAdmin.isActive ? { name: platformAdmin.name } : null;
  }

  return null;
}
