import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kraTemplates } from "@/features/kra/schema";
import type {
  KraTemplate,
  ListKraTemplatesQueryInput,
} from "@/features/kra/types";
import { listKraTemplatesQuerySchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

export async function getAllKraTemplates(
  companyId: string,
  currentUserRole: UserRole,
  query: ListKraTemplatesQueryInput = {},
): Promise<PaginatedResult<KraTemplate>> {
  // KRA templates are admin tooling -- only admins assign KRAs, so only
  // admins have any use for browsing or managing the templates behind them.
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can view KRA templates.");
  }

  const result = listKraTemplatesQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { page, limit, isActive, type, search } = result.data;

  const filters = [
    eq(kraTemplates.companyId, companyId),
    isActive !== undefined ? eq(kraTemplates.isActive, isActive) : undefined,
    type ? eq(kraTemplates.type, type) : undefined,
    search ? ilike(kraTemplates.name, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = and(...filters);

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(kraTemplates)
        .where(where)
        .orderBy(desc(kraTemplates.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(kraTemplates).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
