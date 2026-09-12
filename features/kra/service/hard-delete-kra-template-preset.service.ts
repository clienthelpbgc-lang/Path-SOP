import { eq } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { kraTemplatePresets } from "@/features/kra/schema";
import type { KraTemplatePreset } from "@/features/kra/types";
import { kraTemplatePresetIdSchema } from "@/features/kra/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Unlike deleteKraTemplatePreset (soft delete), this permanently removes
// the row. Nothing references a preset's id -- KRAs created from one never
// get a templateId pointing at it (see kraTemplatePresetToTemplateLike) --
// so there's nothing to leave dangling.
export async function hardDeleteKraTemplatePreset(
  id: string,
): Promise<KraTemplatePreset> {
  const idResult = kraTemplatePresetIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid preset id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  try {
    const [preset] = await systemDb
      .delete(kraTemplatePresets)
      .where(eq(kraTemplatePresets.id, idResult.data))
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
