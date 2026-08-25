import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import type { TaskStatus } from "@/features/task/constants/task-status.constant";
import { computeNextRunAt } from "@/features/task/service/recurrence";
import {
  cancelScheduledReminders,
  recomputeScheduledReminders,
} from "@/features/task/service/reminder-schedule";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import { assertUserInCompany } from "@/features/task/service/user-scope";
import { tasks } from "@/features/task/schema";
import type { NewTask, Task, UpdateTaskInput } from "@/features/task/types";
import { taskIdSchema, updateTaskSchema } from "@/features/task/validators";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

const CONTENT_FIELDS = [
  "title",
  "description",
  "assignedTo",
  "weightage",
  "startAt",
  "dueAt",
  "isRepeating",
  "repeatUnit",
  "repeatInterval",
  "repeatDaysOfWeek",
  "repeatEndsAt",
] as const;

const REPEAT_RELEVANT_FIELDS = [
  "startAt",
  "isRepeating",
  "repeatUnit",
  "repeatInterval",
  "repeatDaysOfWeek",
  "repeatEndsAt",
] as const;

const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ["in_progress"],
  in_progress: ["completed"],
  completed: [],
};

export async function updateTask(
  companyId: string,
  userId: string,
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const idResult = taskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateTaskSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid task data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const existing = await getTaskScope(companyId, idResult.data);

  assertTaskParticipant(existing, userId);
  assertTaskEditable(existing);

  const isCreator = existing.createdBy === userId;
  const isAssignee = existing.assignedTo === userId;

  const { status: nextStatus, completionRemarks, ...contentFields } =
    result.data;
  const updateValues: Partial<NewTask> = {};

  for (const field of CONTENT_FIELDS) {
    if (field in contentFields) {
      if (!isCreator) {
        throw new ForbiddenError(
          `Only the task creator can update ${field}.`,
        );
      }

      // @ts-expect-error -- field is a key of contentFields by construction
      updateValues[field] = contentFields[field];
    }
  }

  // Any change to the schedule or repeat config invalidates the cached
  // "when should this spawn its successor" timestamp, so it's recomputed
  // from the effective (updated-or-existing) values.
  if (REPEAT_RELEVANT_FIELDS.some((field) => field in updateValues)) {
    const effectiveIsRepeating = updateValues.isRepeating ?? existing.isRepeating;
    const effectiveRepeatUnit = updateValues.repeatUnit ?? existing.repeatUnit;
    const effectiveRepeatInterval =
      updateValues.repeatInterval ?? existing.repeatInterval;

    updateValues.nextRunAt =
      effectiveIsRepeating && effectiveRepeatUnit && effectiveRepeatInterval
        ? computeNextRunAt({
            startAt: updateValues.startAt ?? existing.startAt,
            repeatUnit: effectiveRepeatUnit,
            repeatInterval: effectiveRepeatInterval,
            repeatDaysOfWeek:
              updateValues.repeatDaysOfWeek ?? existing.repeatDaysOfWeek,
            repeatEndsAt: updateValues.repeatEndsAt ?? existing.repeatEndsAt,
          })
        : null;
  }

  if (completionRemarks !== undefined) {
    if (!isAssignee) {
      throw new ForbiddenError(
        "Only the assignee can update the completion remarks.",
      );
    }

    updateValues.completionRemarks = completionRemarks;
  }

  if (nextStatus !== undefined && nextStatus !== existing.status) {
    if (!isAssignee) {
      throw new ForbiddenError("Only the assignee can change task status.");
    }

    if (!STATUS_TRANSITIONS[existing.status].includes(nextStatus)) {
      throw new ConflictError(
        `Cannot change status from ${existing.status} to ${nextStatus}.`,
      );
    }

    updateValues.status = nextStatus;

    if (nextStatus === "completed") {
      updateValues.completedAt = new Date();
    }
  }

  if (Object.keys(updateValues).length === 0) {
    throw new ValidationError("No permitted fields were provided to update.");
  }

  if (updateValues.assignedTo) {
    await assertUserInCompany(
      companyId,
      updateValues.assignedTo,
      "Assignee not found in your company.",
    );
  }

  const effectiveStartAt = updateValues.startAt ?? existing.startAt;
  const effectiveDueAt = updateValues.dueAt ?? existing.dueAt;
  const scheduleChanged =
    updateValues.startAt !== undefined || updateValues.dueAt !== undefined;

  try {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(tasks)
        .set(updateValues)
        .where(and(eq(tasks.id, idResult.data), eq(tasks.companyId, companyId)))
        .returning();

      if (!updated) {
        throw new NotFoundError("Task not found.");
      }

      if (scheduleChanged) {
        await recomputeScheduledReminders(
          tx,
          updated.id,
          effectiveStartAt,
          effectiveDueAt,
        );
      }

      if (updateValues.status === "completed") {
        await cancelScheduledReminders(tx, updated.id);
      }

      return updated;
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
