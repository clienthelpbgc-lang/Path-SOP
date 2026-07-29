import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { dailyTasks } from "@/features/daily-task/schema";
import type { DailyTask } from "@/features/daily-task/types";
import { dailyTaskIdSchema } from "@/features/daily-task/validation";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteDailyTask(
  companyId: string,
  userId: string,
  id: string,
): Promise<DailyTask> {
  const idResult = dailyTaskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  try {
    const [deleted] = await db
      .delete(dailyTasks)
      .where(
        and(
          eq(dailyTasks.id, idResult.data),
          eq(dailyTasks.companyId, companyId),
          eq(dailyTasks.assignedBy, userId),
          eq(dailyTasks.status, "PENDING"),
        ),
      )
      .returning();

    if (deleted) {
      return deleted;
    }

    const [existing] = await db
      .select({
        assignedBy: dailyTasks.assignedBy,
        status: dailyTasks.status,
      })
      .from(dailyTasks)
      .where(
        and(
          eq(dailyTasks.id, idResult.data),
          eq(dailyTasks.companyId, companyId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundError("Task not found.");
    }

    if (existing.assignedBy !== userId) {
      throw new ForbiddenError(
        "Only the user who assigned this task can delete it.",
      );
    }

    throw new ConflictError(
      "Only tasks that are still pending can be deleted.",
    );
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ConflictError ||
      error instanceof ForbiddenError
    ) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
