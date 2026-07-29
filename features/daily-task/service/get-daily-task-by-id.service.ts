import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { dailyTasks } from "@/features/daily-task/schema";
import type { DailyTaskWithRelations } from "@/features/daily-task/types";
import { dailyTaskIdSchema } from "@/features/daily-task/validation";
import { NotFoundError, ValidationError } from "@/lib/errors";

const PARTY_COLUMNS = { id: true, name: true, email: true } as const;

export async function getDailyTaskById(
  companyId: string,
  id: string,
): Promise<DailyTaskWithRelations> {
  const idResult = dailyTaskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const task = await db.query.dailyTasks.findFirst({
    where: and(
      eq(dailyTasks.id, idResult.data),
      eq(dailyTasks.companyId, companyId),
    ),
    with: {
      assignee: { columns: PARTY_COLUMNS },
      assigner: { columns: PARTY_COLUMNS },
    },
  });

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  return task;
}
