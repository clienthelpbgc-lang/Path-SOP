import { and, eq, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import type { User } from "@/features/user/types";
import { userIdSchema } from "@/features/user/validation";
import { tasks } from "@/features/task/schema";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { createAdminClient } from "@/utils/supabase/admin";

export async function deleteUser(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  id: string,
): Promise<User> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can delete users.");
  }

  const idResult = userIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid user id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  if (idResult.data === currentUserId) {
    throw new ForbiddenError("You cannot delete your own account.");
  }

  const [linkedTask] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.companyId, companyId),
        or(eq(tasks.assignedTo, idResult.data), eq(tasks.createdBy, idResult.data)),
      ),
    )
    .limit(1);

  if (linkedTask) {
    throw new ConflictError(
      "This user has assigned or created tasks. Reassign or remove those tasks before deleting the user.",
    );
  }

  try {
    const [user] = await db
      .delete(users)
      .where(and(eq(users.id, idResult.data), eq(users.companyId, companyId)))
      .returning();

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const supabaseAdmin = createAdminClient();
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(idResult.data);

    if (authError) {
      console.error(
        "Failed to delete Supabase auth user after deleting user row:",
        authError,
      );
    }

    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
