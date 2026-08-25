import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskChecklistItems } from "@/features/task/schema";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import type { TaskChecklistItem } from "@/features/task/types";
import { taskChecklistItemIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteTaskChecklistItem(
  companyId: string,
  userId: string,
  taskId: string,
  itemId: string,
): Promise<TaskChecklistItem> {
  const idResult = taskChecklistItemIdSchema.safeParse(itemId);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid checklist item id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  assertTaskParticipant(task, userId);
  assertTaskEditable(task);

  try {
    const [deleted] = await db
      .delete(taskChecklistItems)
      .where(
        and(
          eq(taskChecklistItems.id, idResult.data),
          eq(taskChecklistItems.taskId, taskId),
        ),
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Checklist item not found.");
    }

    return deleted;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
