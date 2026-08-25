import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  not,
} from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import type { ListTasksQueryInput, Task } from "@/features/task/types";
import { listTasksQuerySchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

const OPEN_STATUSES = ["pending", "in_progress"] as const;

export async function getAllTasks(
  companyId: string,
  query: ListTasksQueryInput = {},
): Promise<PaginatedResult<Task>> {
  const result = listTasksQuerySchema.safeParse(query);

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
    status,
    isRepeating,
    overdue,
    dueDateFrom,
    dueDateTo,
    search,
  } = result.data;

  const isOverdue = and(
    inArray(tasks.status, OPEN_STATUSES),
    lt(tasks.dueAt, new Date()),
  )!;

  const filters = [
    eq(tasks.companyId, companyId),
    assignedTo ? eq(tasks.assignedTo, assignedTo) : undefined,
    status ? eq(tasks.status, status) : undefined,
    isRepeating !== undefined ? eq(tasks.isRepeating, isRepeating) : undefined,
    overdue === true ? isOverdue : undefined,
    overdue === false ? not(isOverdue) : undefined,
    dueDateFrom ? gte(tasks.dueAt, dueDateFrom) : undefined,
    dueDateTo ? lte(tasks.dueAt, dueDateTo) : undefined,
    search ? ilike(tasks.title, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = and(...filters);

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(where)
        .orderBy(desc(tasks.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(tasks).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
