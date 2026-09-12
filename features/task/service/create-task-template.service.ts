import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskTemplates, tasks } from "@/features/task/schema";
import type { CreateTaskTemplateInput, TaskTemplate } from "@/features/task/types";
import { createTaskTemplateSchema } from "@/features/task/validators";
import { BadRequestError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createTaskTemplate(
  companyId: string,
  createdBy: string,
  input: CreateTaskTemplateInput,
): Promise<TaskTemplate> {
  const result = createTaskTemplateSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid template data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  if (result.data.sourceTaskId) {
    const [sourceTask] = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(
        and(
          eq(tasks.id, result.data.sourceTaskId),
          eq(tasks.companyId, companyId),
        ),
      )
      .limit(1);

    if (!sourceTask) {
      throw new BadRequestError("Source task not found in your company.");
    }
  }

  try {
    const [template] = await db
      .insert(taskTemplates)
      .values({ ...result.data, companyId, createdBy })
      .returning();

    return template;
  } catch (error) {
    translateDatabaseError(error);
  }
}
