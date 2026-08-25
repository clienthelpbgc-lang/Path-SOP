import { z } from "zod";

import { db } from "@/db";
import { taskWatchers } from "@/features/task/schema";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import { assertUserInCompany } from "@/features/task/service/user-scope";
import type { TaskWatcher } from "@/features/task/types";
import { createTaskWatcherSchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createTaskWatcher(
  companyId: string,
  actorId: string,
  taskId: string,
  watcherUserId: string,
): Promise<TaskWatcher> {
  const result = createTaskWatcherSchema.safeParse({
    taskId,
    userId: watcherUserId,
  });

  if (!result.success) {
    throw new ValidationError(
      "Invalid watcher data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  assertTaskParticipant(task, actorId);
  assertTaskEditable(task);

  await assertUserInCompany(
    companyId,
    result.data.userId,
    "Watcher not found in your company.",
  );

  try {
    const [watcher] = await db
      .insert(taskWatchers)
      .values(result.data)
      .returning();

    return watcher;
  } catch (error) {
    translateDatabaseError(error);
  }
}
