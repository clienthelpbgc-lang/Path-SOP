import { and, eq, gt, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import type { Kra } from "@/features/kra/types";
import { kraIdSchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteKra(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  id: string,
): Promise<Kra> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can delete a KRA.");
  }

  const idResult = kraIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid KRA id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const now = new Date();

  try {
    // The "not currently active" guard and the ownership check are both
    // baked into the WHERE clause so they happen atomically with the
    // delete -- no window between a separate read and the delete itself
    // where the period could start. An admin can only delete a KRA assigned
    // to themself; the fallback existence check below distinguishes
    // "doesn't exist" from "exists but isn't yours" from "exists, is yours,
    // but is still active".
    const [deleted] = await db
      .delete(kras)
      .where(
        and(
          eq(kras.id, idResult.data),
          eq(kras.companyId, companyId),
          eq(kras.assignedTo, currentUserId),
          or(lt(kras.periodEnd, now), gt(kras.periodStart, now)),
        ),
      )
      .returning();

    if (deleted) {
      return deleted;
    }

    const [existing] = await db
      .select({ id: kras.id, assignedTo: kras.assignedTo })
      .from(kras)
      .where(and(eq(kras.id, idResult.data), eq(kras.companyId, companyId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError("KRA not found.");
    }

    if (existing.assignedTo !== currentUserId) {
      throw new ForbiddenError("You can only delete KRAs assigned to you.");
    }

    throw new ConflictError(
      "This KRA is within its active period and cannot be deleted.",
    );
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ConflictError ||
      error instanceof ForbiddenError
    ) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
