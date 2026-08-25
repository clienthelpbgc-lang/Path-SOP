import { and, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import type { Kra, ListKrasQueryInput } from "@/features/kra/types";
import { listKrasQuerySchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { buildPaginationMeta, type PaginatedResult } from "@/utils/types";

export async function getAllKras(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  query: ListKrasQueryInput = {},
): Promise<PaginatedResult<Kra>> {
  const result = listKrasQuerySchema.safeParse(query);

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
    assignedBy,
    status,
    type,
    periodStartFrom,
    periodStartTo,
    search,
  } = result.data;

  // KRAs are only readable by the admin who manages them and the user
  // they're assigned to -- a non-admin can't widen the list beyond their
  // own KRAs, whether by omitting the filter or by pointing it at someone
  // else.
  if (currentUserRole !== "ADMIN") {
    if (assignedTo && assignedTo !== currentUserId) {
      throw new ForbiddenError("You can only view KRAs assigned to you.");
    }
  }

  const effectiveAssignedTo =
    currentUserRole === "ADMIN" ? assignedTo : currentUserId;

  const filters = [
    eq(kras.companyId, companyId),
    effectiveAssignedTo ? eq(kras.assignedTo, effectiveAssignedTo) : undefined,
    assignedBy ? eq(kras.assignedBy, assignedBy) : undefined,
    status ? eq(kras.status, status) : undefined,
    type ? eq(kras.type, type) : undefined,
    periodStartFrom ? gte(kras.periodStart, periodStartFrom) : undefined,
    periodStartTo ? lte(kras.periodStart, periodStartTo) : undefined,
    search ? ilike(kras.title, `%${search}%`) : undefined,
  ].filter((filter) => filter !== undefined);

  const where = and(...filters);

  try {
    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(kras)
        .where(where)
        .orderBy(desc(kras.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(kras).where(where),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(page, limit, total),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
