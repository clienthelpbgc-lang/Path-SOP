import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { computeReminderScheduledAt } from "@/features/task/service/reminder-schedule";
import { assertTaskEditable, getTaskScope } from "@/features/task/service/task-scope";
import { taskReminders } from "@/features/task/schema";
import type {
  TaskReminder,
  UpdateTaskReminderInput,
} from "@/features/task/types";
import {
  taskReminderIdSchema,
  updateTaskReminderSchema,
} from "@/features/task/validators";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateTaskReminder(
  companyId: string,
  userId: string,
  taskId: string,
  reminderId: string,
  input: UpdateTaskReminderInput,
): Promise<TaskReminder> {
  const idResult = taskReminderIdSchema.safeParse(reminderId);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid reminder id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateTaskReminderSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid reminder data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  if (task.createdBy !== userId) {
    throw new ForbiddenError("Only the task creator can manage reminders.");
  }

  assertTaskEditable(task);

  const [existingReminder] = await db
    .select({
      anchor: taskReminders.anchor,
      offsetMinutes: taskReminders.offsetMinutes,
      status: taskReminders.status,
    })
    .from(taskReminders)
    .where(
      and(eq(taskReminders.id, idResult.data), eq(taskReminders.taskId, taskId)),
    )
    .limit(1);

  if (!existingReminder) {
    throw new NotFoundError("Reminder not found.");
  }

  if (existingReminder.status !== "scheduled") {
    throw new ConflictError("Only scheduled reminders can be updated.");
  }

  const scheduledAt = computeReminderScheduledAt(
    result.data.anchor ?? existingReminder.anchor,
    result.data.offsetMinutes ?? existingReminder.offsetMinutes,
    task.startAt,
    task.dueAt,
  );

  try {
    const [updated] = await db
      .update(taskReminders)
      .set({ ...result.data, scheduledAt })
      .where(
        and(eq(taskReminders.id, idResult.data), eq(taskReminders.taskId, taskId)),
      )
      .returning();

    if (!updated) {
      throw new NotFoundError("Reminder not found.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
