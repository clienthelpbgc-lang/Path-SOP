import { z } from "zod";

import { db } from "@/db";
import { computeReminderScheduledAt } from "@/features/task/service/reminder-schedule";
import {
  assertTaskEditable,
  getTaskScope,
} from "@/features/task/service/task-scope";
import { taskReminders } from "@/features/task/schema";
import type {
  CreateTaskReminderInput,
  TaskReminder,
} from "@/features/task/types";
import { createTaskReminderSchema } from "@/features/task/validators";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createTaskReminder(
  companyId: string,
  userId: string,
  taskId: string,
  input: Omit<CreateTaskReminderInput, "taskId">,
): Promise<TaskReminder> {
  const result = createTaskReminderSchema
    .omit({ taskId: true })
    .safeParse(input);

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

  const scheduledAt = computeReminderScheduledAt(
    result.data.anchor,
    result.data.offsetMinutes,
    task.startAt,
    task.dueAt,
  );

  try {
    const [reminder] = await db
      .insert(taskReminders)
      .values({ ...result.data, taskId, scheduledAt })
      .returning();

    return reminder;
  } catch (error) {
    translateDatabaseError(error);
  }
}
