import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskTemplates } from "@/features/task/schema";
import type { TaskTemplate } from "@/features/task/types";
import { taskTemplateIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Unlike deleteTaskTemplate (soft delete), this permanently removes the
// row. Safe to do -- tasks.templateId is `onDelete: "set null"`, so any
// task already created from this template keeps its own copy of every
// field (title, checklist, reminders, ...) and just loses the bookkeeping
// link back to the template it came from.
export async function hardDeleteTaskTemplate(
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
      .delete(taskTemplates)
      .where(
        and(
          eq(taskTemplates.id, idResult.data),
          eq(taskTemplates.companyId, companyId),
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
