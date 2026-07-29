import { and, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { dailyTasks } from "@/features/daily-task/schema";
import type {
  DailyTask,
  ListDailyTasksQueryInput,
} from "@/features/daily-task/types";
import { listDailyTasksQuerySchema } from "@/features/daily-task/validation";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

export async function getAllDailyTasks(
  companyId: string,
  query: ListDailyTasksQueryInput = {},
): Promise<PaginatedResult<DailyTask>> {
  const result = listDailyTasksQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const {
    page,
    limit,
    assignedTo,
    priority,
    status,
    dueDateFrom,
    dueDateTo,
    search,
  } = result.data;

  const filters = [
    eq(dailyTasks.companyId, companyId),
    assignedTo ? eq(dailyTasks.assignedTo, assignedTo) : undefined,
    priority ? eq(dailyTasks.priority, priority) : undefined,
    status ? eq(dailyTasks.status, status) : undefined,
    dueDateFrom ? gte(dailyTasks.dueDate, dueDateFrom) : undefined,
    dueDateTo ? lte(dailyTasks.dueDate, dueDateTo) : undefined,
    search ? ilike(dailyTasks.title, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = and(...filters);

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(dailyTasks)
        .where(where)
        .orderBy(desc(dailyTasks.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(dailyTasks).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
