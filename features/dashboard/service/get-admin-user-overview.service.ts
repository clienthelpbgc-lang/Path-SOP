import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

import { getDashboardOverview } from "./get-dashboard-overview.service";
import type { AdminUserOverview } from "../types";

// Same data as a team member's own dashboard, viewed by an admin -- reuses
// the personal dashboard's batched query set rather than duplicating it.
export async function getAdminUserOverview(
  companyId: string,
  currentUserRole: UserRole,
  targetUserId: string,
): Promise<AdminUserOverview> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError(
      "Only admins can view another member's dashboard.",
    );
  }

  const [targetUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.id, targetUserId), eq(users.companyId, companyId)))
    .limit(1);

  if (!targetUser) {
    throw new NotFoundError("Team member not found.");
  }

  const overview = await getDashboardOverview(companyId, targetUserId);

  return { user: targetUser, ...overview };
}
