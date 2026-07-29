import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { dailyTasks } from "@/features/daily-task/schema";
import type {
  DailyTask,
  NewDailyTask,
  UpdateDailyTaskInput,
} from "@/features/daily-task/types";
import type { TaskStatus } from "@/features/daily-task/constants/status.constant";
import { dailyTaskIdSchema, updateDailyTaskSchema } from "@/features/daily-task/validation";
import { users } from "@/features/user/schema";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

const ASSIGNER_ONLY_FIELDS = [
  "title",
  "description",
  "dueDate",
  "assignedTo",
  "priority",
] as const;

const TERMINAL_STATUSES = new Set<TaskStatus>([
  "COMPLETED",
  "MISSED",
  "REJECTED",
]);

type Actor = "assignedBy" | "assignedTo";

const STATUS_TRANSITIONS: Record<TaskStatus, { to: TaskStatus; actor: Actor }[]> = {
  PENDING: [{ to: "IN_PROGRESS", actor: "assignedTo" }],
  IN_PROGRESS: [{ to: "SUBMITTED", actor: "assignedTo" }],
  SUBMITTED: [
    { to: "COMPLETED", actor: "assignedBy" },
    { to: "REJECTED", actor: "assignedBy" },
  ],
  COMPLETED: [],
  MISSED: [],
  REJECTED: [],
};

export async function updateDailyTask(
  companyId: string,
  userId: string,
  id: string,
  input: UpdateDailyTaskInput,
): Promise<DailyTask> {
  const idResult = dailyTaskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateDailyTaskSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid task data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const [existing] = await db
    .select({
      assignedBy: dailyTasks.assignedBy,
      assignedTo: dailyTasks.assignedTo,
      status: dailyTasks.status,
    })
    .from(dailyTasks)
    .where(and(eq(dailyTasks.id, idResult.data), eq(dailyTasks.companyId, companyId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Task not found.");
  }

  const isAssignedBy = existing.assignedBy === userId;
  const isAssignedTo = existing.assignedTo === userId;

  if (!isAssignedBy && !isAssignedTo) {
    throw new ForbiddenError(
      "Only the user who assigned this task or the assignee can update it.",
    );
  }

  if (TERMINAL_STATUSES.has(existing.status)) {
    throw new ConflictError(
      "This task is in a terminal state and can no longer be updated.",
    );
  }

  const { status: nextStatus, adminRemark, userRemark, ...contentFields } =
    result.data;
  const updateValues: Partial<NewDailyTask> = {};

  for (const field of ASSIGNER_ONLY_FIELDS) {
    if (field in contentFields) {
      if (!isAssignedBy) {
        throw new ForbiddenError(
          `Only the user who assigned this task can update ${field}.`,
        );
      }

      if (existing.status !== "PENDING") {
        throw new ConflictError(
          `${field} can only be updated while the task is pending.`,
        );
      }

      // @ts-expect-error -- field is a key of contentFields by construction
      updateValues[field] = contentFields[field];
    }
  }

  if (adminRemark !== undefined) {
    if (!isAssignedBy) {
      throw new ForbiddenError(
        "Only the user who assigned this task can update the admin remark.",
      );
    }

    updateValues.adminRemark = adminRemark;
  }

  if (userRemark !== undefined) {
    if (!isAssignedTo) {
      throw new ForbiddenError("Only the assignee can update the user remark.");
    }

    updateValues.userRemark = userRemark;
  }

  if (nextStatus !== undefined && nextStatus !== existing.status) {
    const transition = STATUS_TRANSITIONS[existing.status].find(
      (candidate) => candidate.to === nextStatus,
    );

    if (!transition) {
      throw new ConflictError(
        `Cannot change status from ${existing.status} to ${nextStatus}.`,
      );
    }

    const actorMatches =
      transition.actor === "assignedBy" ? isAssignedBy : isAssignedTo;

    if (!actorMatches) {
      throw new ForbiddenError(
        `Only the ${transition.actor === "assignedBy" ? "assigner" : "assignee"} can change status from ${existing.status} to ${nextStatus}.`,
      );
    }

    updateValues.status = nextStatus;
  }

  if (Object.keys(updateValues).length === 0) {
    throw new BadRequestError("No permitted fields were provided to update.");
  }

  if (updateValues.assignedTo) {
    const [assignee] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(eq(users.id, updateValues.assignedTo), eq(users.companyId, companyId)),
      )
      .limit(1);

    if (!assignee) {
      throw new BadRequestError("Assignee not found in your company.");
    }
  }

  try {
    const [updated] = await db
      .update(dailyTasks)
      .set(updateValues)
      .where(and(eq(dailyTasks.id, idResult.data), eq(dailyTasks.companyId, companyId)))
      .returning();

    if (!updated) {
      throw new NotFoundError("Task not found.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
