import { z } from "zod";

import { db } from "@/db";
import { taskChecklistItems } from "@/features/task/schema";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import type {
  CreateTaskChecklistItemInput,
  TaskChecklistItem,
} from "@/features/task/types";
import { createTaskChecklistItemSchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createTaskChecklistItem(
  companyId: string,
  userId: string,
  taskId: string,
  input: Omit<CreateTaskChecklistItemInput, "taskId">,
): Promise<TaskChecklistItem> {
  const result = createTaskChecklistItemSchema
    .omit({ taskId: true })
    .safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid checklist item data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  assertTaskParticipant(task, userId);
  assertTaskEditable(task);

  try {
    const [item] = await db
      .insert(taskChecklistItems)
      .values({ ...result.data, taskId })
      .returning();

    return item;
  } catch (error) {
    translateDatabaseError(error);
  }
}
