import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { companies } from "@/features/company/schema";
import type { Company, ListCompaniesQueryInput } from "@/features/company/types";
import { listCompaniesQuerySchema } from "@/features/company/validation";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

export async function getAllCompanies(
  query: ListCompaniesQueryInput = {},
): Promise<PaginatedResult<Company>> {
  const result = listCompaniesQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { page, limit, isActive, search } = result.data;

  const filters = [
    isActive !== undefined ? eq(companies.isActive, isActive) : undefined,
    search ? ilike(companies.name, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = filters.length > 0 ? and(...filters) : undefined;

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(companies)
        .where(where)
        .orderBy(desc(companies.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(companies).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
