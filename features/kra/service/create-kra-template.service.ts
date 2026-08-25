import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kraTemplates, kras } from "@/features/kra/schema";
import { assertUserInCompany } from "@/features/kra/service/user-scope";
import type { CreateKraTemplateInput, KraTemplate } from "@/features/kra/types";
import { createKraTemplateSchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { BadRequestError, ForbiddenError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createKraTemplate(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  input: CreateKraTemplateInput,
): Promise<KraTemplate> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can create a KRA template.");
  }

  const result = createKraTemplateSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid template data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  if (result.data.sourceKraId) {
    const [sourceKra] = await db
      .select({ id: kras.id })
      .from(kras)
      .where(
        and(
          eq(kras.id, result.data.sourceKraId),
          eq(kras.companyId, companyId),
        ),
      )
      .limit(1);

    if (!sourceKra) {
      throw new BadRequestError("Source KRA not found in your company.");
    }
  }

  if (result.data.defaultAssignee) {
    await assertUserInCompany(
      companyId,
      result.data.defaultAssignee,
      "Default assignee not found in your company.",
    );
  }

  try {
    const [template] = await db
      .insert(kraTemplates)
      .values({ ...result.data, companyId, createdBy: currentUserId })
      .returning();

    return template;
  } catch (error) {
    translateDatabaseError(error);
  }
}
