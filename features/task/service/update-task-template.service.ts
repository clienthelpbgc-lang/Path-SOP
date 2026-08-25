import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskTemplates } from "@/features/task/schema";
import { assertUserInCompany, assertUsersInCompany } from "@/features/task/service/user-scope";
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

  if (result.data.defaultAssignee) {
    await assertUserInCompany(
      companyId,
      result.data.defaultAssignee,
      "Default assignee not found in your company.",
    );
  }

  if (result.data.defaultWatchers) {
    await assertUsersInCompany(
      companyId,
      result.data.defaultWatchers,
      "One or more default watchers were not found in your company.",
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
