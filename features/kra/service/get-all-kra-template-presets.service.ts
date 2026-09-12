import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { kraTemplatePresets } from "@/features/kra/schema";
import type {
  KraTemplatePreset,
  ListKraTemplatePresetsQueryInput,
} from "@/features/kra/types";
import { listKraTemplatePresetsQuerySchema } from "@/features/kra/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

// Platform-admin-facing: paginated/filterable, backs the preset management
// page. Reads via systemDb since presets have no company to scope a
// tenant-scoped `db` call by in the first place -- see
// get-active-kra-template-presets.service.ts for the tenant-facing read.
export async function getAllKraTemplatePresets(
  query: ListKraTemplatePresetsQueryInput = {},
): Promise<PaginatedResult<KraTemplatePreset>> {
  const result = listKraTemplatePresetsQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { page, limit, isActive, type, search } = result.data;

  const filters = [
    isActive !== undefined
      ? eq(kraTemplatePresets.isActive, isActive)
      : undefined,
    type ? eq(kraTemplatePresets.type, type) : undefined,
    search ? ilike(kraTemplatePresets.name, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = filters.length > 0 ? and(...filters) : undefined;

  try {
    const [data, [{ total }]] = await Promise.all([
      systemDb
        .select()
        .from(kraTemplatePresets)
        .where(where)
        .orderBy(desc(kraTemplatePresets.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      systemDb.select({ total: count() }).from(kraTemplatePresets).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
