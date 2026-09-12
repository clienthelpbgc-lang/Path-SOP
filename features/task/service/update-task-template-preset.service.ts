import { eq } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { taskTemplatePresets } from "@/features/task/schema";
import type {
  TaskTemplatePreset,
  UpdateTaskTemplatePresetInput,
} from "@/features/task/types";
import {
  taskTemplatePresetIdSchema,
  updateTaskTemplatePresetSchema,
} from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateTaskTemplatePreset(
  id: string,
  input: UpdateTaskTemplatePresetInput,
): Promise<TaskTemplatePreset> {
  const idResult = taskTemplatePresetIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid preset id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateTaskTemplatePresetSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid preset data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [updated] = await systemDb
      .update(taskTemplatePresets)
      .set(result.data)
      .where(eq(taskTemplatePresets.id, idResult.data))
      .returning();

    if (!updated) {
      throw new NotFoundError("Preset not found.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
