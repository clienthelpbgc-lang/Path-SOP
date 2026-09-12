import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { taskTemplatePresets } from "@/features/task/schema";
import type {
  ListTaskTemplatePresetsQueryInput,
  TaskTemplatePreset,
} from "@/features/task/types";
import { listTaskTemplatePresetsQuerySchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

// Platform-admin-facing: paginated/filterable, backs the preset management
// page. Reads via systemDb since presets have no company to scope a
// tenant-scoped `db` call by in the first place -- see
// get-active-task-template-presets.service.ts for the tenant-facing read.
export async function getAllTaskTemplatePresets(
  query: ListTaskTemplatePresetsQueryInput = {},
): Promise<PaginatedResult<TaskTemplatePreset>> {
  const result = listTaskTemplatePresetsQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { page, limit, isActive, isRepeating, search } = result.data;

  const filters = [
    isActive !== undefined
      ? eq(taskTemplatePresets.isActive, isActive)
      : undefined,
    isRepeating !== undefined
      ? eq(taskTemplatePresets.isRepeating, isRepeating)
      : undefined,
    search ? ilike(taskTemplatePresets.name, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = filters.length > 0 ? and(...filters) : undefined;

  try {
    const [data, [{ total }]] = await Promise.all([
      systemDb
        .select()
        .from(taskTemplatePresets)
        .where(where)
        .orderBy(desc(taskTemplatePresets.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      systemDb.select({ total: count() }).from(taskTemplatePresets).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
