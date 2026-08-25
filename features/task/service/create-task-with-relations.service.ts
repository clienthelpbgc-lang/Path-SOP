import { z } from "zod";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { computeNextRunAt } from "@/features/task/service/recurrence";
import { computeReminderScheduledAt } from "@/features/task/service/reminder-schedule";
import { getTaskById } from "@/features/task/service/get-task-by-id.service";
import { assertUserInCompany, assertUsersInCompany } from "@/features/task/service/user-scope";
import {
  taskAttachments,
  taskChecklistItems,
  taskReminders,
  taskTemplates,
  taskWatchers,
  tasks,
} from "@/features/task/schema";
import type {
  CreateTaskWithRelationsInput,
  TaskWithRelations,
} from "@/features/task/types";
import { createTaskWithRelationsSchema } from "@/features/task/validators";
import { BadRequestError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createTaskWithRelations(
  companyId: string,
  createdBy: string,
  input: CreateTaskWithRelationsInput,
): Promise<TaskWithRelations> {
  const result = createTaskWithRelationsSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid task data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { checklistItems, reminders, attachments, watcherIds, ...taskFields } =
    result.data;

  await assertUserInCompany(
    companyId,
    taskFields.assignedTo,
    "Assignee not found in your company.",
  );

  await assertUsersInCompany(
    companyId,
    watcherIds,
    "One or more watchers were not found in your company.",
  );

  if (taskFields.templateId) {
    const [template] = await db
      .select({ id: taskTemplates.id })
      .from(taskTemplates)
      .where(
        and(
          eq(taskTemplates.id, taskFields.templateId),
          eq(taskTemplates.companyId, companyId),
        ),
      )
      .limit(1);

    if (!template) {
      throw new BadRequestError("Template not found in your company.");
    }
  }

  const nextRunAt = taskFields.isRepeating
    ? computeNextRunAt({
        startAt: taskFields.startAt,
        repeatUnit: taskFields.repeatUnit!,
        repeatInterval: taskFields.repeatInterval!,
        repeatDaysOfWeek: taskFields.repeatDaysOfWeek ?? null,
        repeatEndsAt: taskFields.repeatEndsAt ?? null,
      })
    : null;

  let createdTaskId: string;

  try {
    createdTaskId = await db.transaction(async (tx) => {
      const [task] = await tx
        .insert(tasks)
        .values({ ...taskFields, companyId, createdBy, nextRunAt })
        .returning();

      if (checklistItems.length > 0) {
        await tx.insert(taskChecklistItems).values(
          checklistItems.map((item) => ({ ...item, taskId: task.id })),
        );
      }

      if (reminders.length > 0) {
        await tx.insert(taskReminders).values(
          reminders.map((reminder) => ({
            ...reminder,
            taskId: task.id,
            scheduledAt: computeReminderScheduledAt(
              reminder.anchor,
              reminder.offsetMinutes,
              task.startAt,
              task.dueAt,
            ),
          })),
        );
      }

      if (attachments.length > 0) {
        await tx.insert(taskAttachments).values(
          attachments.map((attachment) => ({
            ...attachment,
            taskId: task.id,
            uploadedBy: createdBy,
          })),
        );
      }

      if (watcherIds.length > 0) {
        await tx.insert(taskWatchers).values(
          watcherIds.map((userId) => ({ taskId: task.id, userId })),
        );
      }

      return task.id;
    });
  } catch (error) {
    translateDatabaseError(error);
  }

  return getTaskById(companyId, createdTaskId);
}
