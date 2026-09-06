import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks, taskWatchers } from "@/features/task/schema";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import { notifyWatcherAdded } from "@/features/task/service/notify-task-assignment.service";
import { assertUserInCompany } from "@/features/task/service/user-scope";
import type { TaskWatcher } from "@/features/task/types";
import { createTaskWatcherSchema } from "@/features/task/validators";
import { users } from "@/features/user/schema";
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

  let watcher: TaskWatcher;

  try {
    [watcher] = await db.insert(taskWatchers).values(result.data).returning();
  } catch (error) {
    translateDatabaseError(error);
  }

  const [taskRow] = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueAt: tasks.dueAt,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  const [watcherUser] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, result.data.userId))
    .limit(1);
  const [actorUser] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, actorId))
    .limit(1);

  if (taskRow && watcherUser && actorUser) {
    await notifyWatcherAdded(taskRow, watcherUser, actorUser.name);
  }

  return watcher;
}
