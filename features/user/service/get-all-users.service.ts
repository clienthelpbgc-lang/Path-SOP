import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/features/user/schema";
import type { ListUsersQueryInput, User } from "@/features/user/types";
import { listUsersQuerySchema } from "@/features/user/validation";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

export async function getAllUsers(
  companyId: string,
  query: ListUsersQueryInput = {},
): Promise<PaginatedResult<User>> {
  const result = listUsersQuerySchema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { page, limit, role, isActive, search } = result.data;

  const filters = [
    eq(users.companyId, companyId),
    role ? eq(users.role, role) : undefined,
    isActive !== undefined ? eq(users.isActive, isActive) : undefined,
    search ? ilike(users.name, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = filters.length > 0 ? and(...filters) : undefined;

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(users).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
