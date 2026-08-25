import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskWatchers } from "@/features/task/schema";
import { assertTaskParticipant, getTaskScope } from "@/features/task/service/task-scope";
import type { TaskWatcher } from "@/features/task/types";
import { createTaskWatcherSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteTaskWatcher(
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

  try {
    const [deleted] = await db
      .delete(taskWatchers)
      .where(
        and(
          eq(taskWatchers.taskId, result.data.taskId),
          eq(taskWatchers.userId, result.data.userId),
        ),
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Watcher not found.");
    }

    return deleted;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
