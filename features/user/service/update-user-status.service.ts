import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import type { UpdateUserStatusInput, User } from "@/features/user/types";
import { updateUserStatusSchema, userIdSchema } from "@/features/user/validation";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateUserStatus(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  id: string,
  input: UpdateUserStatusInput,
): Promise<User> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can activate or deactivate users.");
  }

  const idResult = userIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid user id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  if (idResult.data === currentUserId) {
    throw new ForbiddenError("You cannot deactivate your own account.");
  }

  const result = updateUserStatusSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid status.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [user] = await db
      .update(users)
      .set({ isActive: result.data.isActive })
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
