import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import type { Task } from "@/features/task/types";
import { taskIdSchema } from "@/features/task/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

// Admin-only escape hatch: normal task edits (including toggling
// `isRepeating`) are locked to the creator and only while the task is still
// editable (see update-task.service.ts / task-scope.ts), so once an
// occurrence moves past "pending" nobody can stop its series through the
// regular edit flow. This bypasses both the creator-only and editable-status
// checks -- it only ever changes the repeat scheduling fields, never task
// content.
export async function stopRepeatingTask(
  companyId: string,
  currentUserRole: UserRole,
  id: string,
): Promise<Task> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can stop a repeating task.");
  }

  const idResult = taskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const [updated] = await db
    .update(tasks)
    .set({ isRepeating: false, nextRunAt: null })
    .where(and(eq(tasks.id, idResult.data), eq(tasks.companyId, companyId)))
    .returning();

  if (!updated) {
    throw new NotFoundError("Task not found.");
  }

  return updated;
}
