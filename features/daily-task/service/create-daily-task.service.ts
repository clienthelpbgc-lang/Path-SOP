import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { dailyTasks } from "@/features/daily-task/schema";
import type {
  CreateDailyTaskInput,
  DailyTask,
} from "@/features/daily-task/types";
import { createDailyTaskSchema } from "@/features/daily-task/validation";
import { users } from "@/features/user/schema";
import { BadRequestError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createDailyTask(
  companyId: string,
  assignedBy: string,
  input: CreateDailyTaskInput,
): Promise<DailyTask> {
  const result = createDailyTaskSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid task data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const [assignee] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.id, result.data.assignedTo),
        eq(users.companyId, companyId),
      ),
    )
    .limit(1);

  if (!assignee) {
    throw new BadRequestError("Assignee not found in your company.");
  }

  try {
    const [task] = await db
      .insert(dailyTasks)
      .values({
        ...result.data,
        companyId,
        assignedBy,
      })
      .returning();

    return task;
  } catch (error) {
    translateDatabaseError(error);
  }
}
