import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/features/user/schema";
import { BadRequestError } from "@/lib/errors";

export async function assertUserInCompany(
  companyId: string,
  userId: string,
  message = "User not found in your company.",
): Promise<void> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.companyId, companyId)))
    .limit(1);

  if (!row) {
    throw new BadRequestError(message);
  }
}
