import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskChecklistItems } from "@/features/task/schema";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import type {
  TaskChecklistItem,
  UpdateTaskChecklistItemInput,
} from "@/features/task/types";
import {
  taskChecklistItemIdSchema,
  updateTaskChecklistItemSchema,
} from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateTaskChecklistItem(
  companyId: string,
  userId: string,
  taskId: string,
  itemId: string,
  input: UpdateTaskChecklistItemInput,
): Promise<TaskChecklistItem> {
  const idResult = taskChecklistItemIdSchema.safeParse(itemId);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid checklist item id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateTaskChecklistItemSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid checklist item data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  assertTaskParticipant(task, userId);
  assertTaskEditable(task);

  const { isDone, ...rest } = result.data;
  const updateValues: Partial<TaskChecklistItem> = { ...rest };

  if (isDone !== undefined) {
    updateValues.isDone = isDone;
    updateValues.doneAt = isDone ? new Date() : null;
    updateValues.doneBy = isDone ? userId : null;
  }

  try {
    const [updated] = await db
      .update(taskChecklistItems)
      .set(updateValues)
      .where(
        and(
          eq(taskChecklistItems.id, idResult.data),
          eq(taskChecklistItems.taskId, taskId),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundError("Checklist item not found.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
