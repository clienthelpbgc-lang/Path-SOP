import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kraTemplates } from "@/features/kra/schema";
import type { KraTemplate, UpdateKraTemplateInput } from "@/features/kra/types";
import {
  kraTemplateIdSchema,
  updateKraTemplateSchema,
} from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateKraTemplate(
  companyId: string,
  currentUserRole: UserRole,
  id: string,
  input: UpdateKraTemplateInput,
): Promise<KraTemplate> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can update a KRA template.");
  }

  const idResult = kraTemplateIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid template id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateKraTemplateSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid template data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [updated] = await db
      .update(kraTemplates)
      .set(result.data)
      .where(
        and(
          eq(kraTemplates.id, idResult.data),
          eq(kraTemplates.companyId, companyId),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundError("Template not found.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
