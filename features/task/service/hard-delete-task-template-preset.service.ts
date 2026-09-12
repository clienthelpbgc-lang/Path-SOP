import { eq } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { taskTemplatePresets } from "@/features/task/schema";
import type { TaskTemplatePreset } from "@/features/task/types";
import { taskTemplatePresetIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Unlike deleteTaskTemplatePreset (soft delete), this permanently removes
// the row. Nothing references a preset's id -- tasks created from one never
// get a templateId pointing at it (see taskTemplatePresetToTemplateLike) --
// so there's nothing to leave dangling.
export async function hardDeleteTaskTemplatePreset(
  id: string,
): Promise<TaskTemplatePreset> {
  const idResult = taskTemplatePresetIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid preset id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  try {
    const [preset] = await systemDb
      .delete(taskTemplatePresets)
      .where(eq(taskTemplatePresets.id, idResult.data))
      .returning();

    if (!preset) {
      throw new NotFoundError("Preset not found.");
    }

    return preset;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
