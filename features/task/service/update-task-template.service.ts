import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskTemplates } from "@/features/task/schema";
import type { TaskTemplate, UpdateTaskTemplateInput } from "@/features/task/types";
import {
  taskTemplateIdSchema,
  updateTaskTemplateSchema,
} from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateTaskTemplate(
  companyId: string,
  id: string,
  input: UpdateTaskTemplateInput,
): Promise<TaskTemplate> {
  const idResult = taskTemplateIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid template id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateTaskTemplateSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid template data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [updated] = await db
      .update(taskTemplates)
      .set(result.data)
      .where(
        and(eq(taskTemplates.id, idResult.data), eq(taskTemplates.companyId, companyId)),
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
