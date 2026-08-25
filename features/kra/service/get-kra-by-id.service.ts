import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import type { KraWithRelations } from "@/features/kra/types";
import { kraIdSchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

const PARTY_COLUMNS = { id: true, name: true, email: true } as const;

export async function getKraById(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  id: string,
): Promise<KraWithRelations> {
  const idResult = kraIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid KRA id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const kra = await db.query.kras.findFirst({
    where: and(eq(kras.id, idResult.data), eq(kras.companyId, companyId)),
    with: {
      assignee: { columns: PARTY_COLUMNS },
      assigner: { columns: PARTY_COLUMNS },
    },
  });

  if (!kra) {
    throw new NotFoundError("KRA not found.");
  }

  // KRAs are only readable by the admin who manages them and the user
  // they're assigned to -- unlike tasks, which are company-visible.
  if (currentUserRole !== "ADMIN" && kra.assignedTo !== currentUserId) {
    throw new ForbiddenError("You do not have permission to view this KRA.");
  }

  return kra;
}
