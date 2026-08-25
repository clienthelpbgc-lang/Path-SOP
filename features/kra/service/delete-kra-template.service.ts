import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kraTemplates } from "@/features/kra/schema";
import type { KraTemplate } from "@/features/kra/types";
import { kraTemplateIdSchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteKraTemplate(
  companyId: string,
  currentUserRole: UserRole,
  id: string,
): Promise<KraTemplate> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can delete a KRA template.");
  }

  const idResult = kraTemplateIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid template id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  try {
    const [template] = await db
      .update(kraTemplates)
      .set({ isActive: false })
      .where(
        and(
          eq(kraTemplates.id, idResult.data),
          eq(kraTemplates.companyId, companyId),
        ),
      )
      .returning();

    if (!template) {
      throw new NotFoundError("Template not found.");
    }

    return template;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
