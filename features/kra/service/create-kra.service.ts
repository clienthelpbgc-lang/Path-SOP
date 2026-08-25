import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { kraTemplates, kras } from "@/features/kra/schema";
import { assertUserInCompany } from "@/features/kra/service/user-scope";
import type { CreateKraInput, Kra } from "@/features/kra/types";
import { createKraSchema } from "@/features/kra/validators";
import type { UserRole } from "@/features/user/constants/role.constant";
import { BadRequestError, ForbiddenError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createKra(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  input: CreateKraInput,
): Promise<Kra> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can assign a KRA.");
  }

  const result = createKraSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid KRA data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  await assertUserInCompany(
    companyId,
    result.data.assignedTo,
    "Assignee not found in your company.",
  );

  if (result.data.templateId) {
    const [template] = await db
      .select({ id: kraTemplates.id })
      .from(kraTemplates)
      .where(
        and(
          eq(kraTemplates.id, result.data.templateId),
          eq(kraTemplates.companyId, companyId),
        ),
      )
      .limit(1);

    if (!template) {
      throw new BadRequestError("Template not found in your company.");
    }
  }

  try {
    const [kra] = await db
      .insert(kras)
      .values({ ...result.data, companyId, assignedBy: currentUserId })
      .returning();

    return kra;
  } catch (error) {
    translateDatabaseError(error);
  }
}
