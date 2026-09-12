import { eq } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { kraTemplatePresets } from "@/features/kra/schema";
import type {
  KraTemplatePreset,
  UpdateKraTemplatePresetInput,
} from "@/features/kra/types";
import {
  kraTemplatePresetIdSchema,
  updateKraTemplatePresetSchema,
} from "@/features/kra/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateKraTemplatePreset(
  id: string,
  input: UpdateKraTemplatePresetInput,
): Promise<KraTemplatePreset> {
  const idResult = kraTemplatePresetIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid preset id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const result = updateKraTemplatePresetSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid preset data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [updated] = await systemDb
      .update(kraTemplatePresets)
      .set(result.data)
      .where(eq(kraTemplatePresets.id, idResult.data))
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
