import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import type { TaskStatus } from "@/features/task/constants/task-status.constant";
import { tasks } from "@/features/task/schema";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";

interface TaskScope {
  id: string;
  companyId: string;
  createdBy: string;
  assignedTo: string;
  status: TaskStatus;
  startAt: Date;
  dueAt: Date;
  isRepeating: boolean;
  repeatUnit: RepeatUnit | null;
  repeatInterval: number | null;
  repeatDaysOfWeek: number[] | null;
  repeatEndsAt: Date | null;
}

export async function getTaskScope(
  companyId: string,
  taskId: string,
): Promise<TaskScope> {
  const [task] = await db
    .select({
      id: tasks.id,
      companyId: tasks.companyId,
      createdBy: tasks.createdBy,
      assignedTo: tasks.assignedTo,
      status: tasks.status,
      startAt: tasks.startAt,
      dueAt: tasks.dueAt,
      isRepeating: tasks.isRepeating,
      repeatUnit: tasks.repeatUnit,
      repeatInterval: tasks.repeatInterval,
      repeatDaysOfWeek: tasks.repeatDaysOfWeek,
      repeatEndsAt: tasks.repeatEndsAt,
    })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.companyId, companyId)))
    .limit(1);

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  return task;
}

export function assertTaskParticipant(task: TaskScope, userId: string): void {
  if (task.createdBy !== userId && task.assignedTo !== userId) {
    throw new ForbiddenError(
      "Only the task creator or assignee can perform this action.",
    );
  }
}

export function assertTaskEditable(task: TaskScope): void {
  if (task.status === "completed") {
    throw new ConflictError(
      "This task is completed and can no longer be modified.",
    );
  }
}
