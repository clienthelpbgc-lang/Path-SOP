import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { getTaskScope } from "@/features/task/service/task-scope";
import { taskReminders } from "@/features/task/schema";
import type { TaskReminder } from "@/features/task/types";
import { taskReminderIdSchema } from "@/features/task/validators";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteTaskReminder(
  companyId: string,
  userId: string,
  taskId: string,
  reminderId: string,
): Promise<TaskReminder> {
  const idResult = taskReminderIdSchema.safeParse(reminderId);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid reminder id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  if (task.createdBy !== userId) {
    throw new ForbiddenError("Only the task creator can manage reminders.");
  }

  try {
    const [deleted] = await db
      .delete(taskReminders)
      .where(
        and(eq(taskReminders.id, idResult.data), eq(taskReminders.taskId, taskId)),
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Reminder not found.");
    }

    return deleted;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
