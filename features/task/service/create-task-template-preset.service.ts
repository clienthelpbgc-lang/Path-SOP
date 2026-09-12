import { z } from "zod";

import { systemDb } from "@/db";
import { taskTemplatePresets } from "@/features/task/schema";
import type {
  CreateTaskTemplatePresetInput,
  TaskTemplatePreset,
} from "@/features/task/types";
import { createTaskTemplatePresetSchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Presets are platform-wide, authored only by platform admins -- writes
// always go through systemDb (the privileged, non-RLS connection), never
// the tenant-scoped `db`. See db/migrations for the RLS policy that makes
// this table read-only for every tenant.
export async function createTaskTemplatePreset(
  createdBy: string,
  input: CreateTaskTemplatePresetInput,
): Promise<TaskTemplatePreset> {
  const result = createTaskTemplatePresetSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid preset data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [preset] = await systemDb
      .insert(taskTemplatePresets)
      .values({ ...result.data, createdBy })
      .returning();

    return preset;
  } catch (error) {
    translateDatabaseError(error);
  }
}
