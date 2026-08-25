import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import type { Kra, UpdateKraInput } from "@/features/kra/types";
import { kraIdSchema, updateKraSchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateKra(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  id: string,
  input: UpdateKraInput,
): Promise<Kra> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can update a KRA.");
  }

  const idResult = kraIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid KRA id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  // `updateKraSchema` has no `assignedTo`/`assignedBy` fields at all, so
  // there's nothing further to strip here -- who a KRA is assigned to/by is
  // fixed at creation time and can't be reassigned through this path.
  const result = updateKraSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid KRA data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  // A single update statement is already atomic -- no transaction needed
  // here since, unlike task status changes, updating a KRA has no related
  // rows (reminders, etc.) to keep in sync. An admin can only update a KRA
  // assigned to themself, so that ownership check is baked into the WHERE
  // clause -- the fallback existence check below distinguishes "doesn't
  // exist" from "exists but isn't yours".
  try {
    const [kra] = await db
      .update(kras)
      .set(result.data)
      .where(
        and(
          eq(kras.id, idResult.data),
          eq(kras.companyId, companyId),
          eq(kras.assignedTo, currentUserId),
        ),
      )
      .returning();

    if (kra) {
      return kra;
    }

    const [existing] = await db
      .select({ id: kras.id })
      .from(kras)
      .where(and(eq(kras.id, idResult.data), eq(kras.companyId, companyId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError("KRA not found.");
    }

    throw new ForbiddenError("You can only update KRAs assigned to you.");
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
