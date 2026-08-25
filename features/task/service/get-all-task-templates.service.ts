import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskTemplates } from "@/features/task/schema";
import type {
  ListTaskTemplatesQueryInput,
  TaskTemplate,
} from "@/features/task/types";
import { listTaskTemplatesQuerySchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

export async function getAllTaskTemplates(
  companyId: string,
  query: ListTaskTemplatesQueryInput = {},
): Promise<PaginatedResult<TaskTemplate>> {
  const result = listTaskTemplatesQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { page, limit, isActive, isRepeating, search } = result.data;

  const filters = [
    eq(taskTemplates.companyId, companyId),
    isActive !== undefined ? eq(taskTemplates.isActive, isActive) : undefined,
    isRepeating !== undefined
      ? eq(taskTemplates.isRepeating, isRepeating)
      : undefined,
    search ? ilike(taskTemplates.name, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = and(...filters);

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(taskTemplates)
        .where(where)
        .orderBy(desc(taskTemplates.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(taskTemplates).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
