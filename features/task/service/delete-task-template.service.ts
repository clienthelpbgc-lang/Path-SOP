import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskTemplates } from "@/features/task/schema";
import type { TaskTemplate } from "@/features/task/types";
import { taskTemplateIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteTaskTemplate(
  companyId: string,
  id: string,
): Promise<TaskTemplate> {
  const idResult = taskTemplateIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid template id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  try {
    const [template] = await db
      .update(taskTemplates)
      .set({ isActive: false })
      .where(
        and(eq(taskTemplates.id, idResult.data), eq(taskTemplates.companyId, companyId)),
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
