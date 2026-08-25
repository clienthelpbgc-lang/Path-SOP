import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import type { UpdateUserRoleInput, User } from "@/features/user/types";
import { updateUserRoleSchema, userIdSchema } from "@/features/user/validation";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateUserRole(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  id: string,
  input: UpdateUserRoleInput,
): Promise<User> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can change a user's role.");
  }

  const idResult = userIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid user id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  if (idResult.data === currentUserId) {
    throw new ForbiddenError("You cannot change your own role.");
  }

  const result = updateUserRoleSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid role.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [user] = await db
      .update(users)
      .set({ role: result.data.role })
      .where(and(eq(users.id, idResult.data), eq(users.companyId, companyId)))
      .returning();

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
