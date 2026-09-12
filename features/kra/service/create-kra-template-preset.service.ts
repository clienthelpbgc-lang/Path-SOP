import { z } from "zod";

import { systemDb } from "@/db";
import { kraTemplatePresets } from "@/features/kra/schema";
import type {
  CreateKraTemplatePresetInput,
  KraTemplatePreset,
} from "@/features/kra/types";
import { createKraTemplatePresetSchema } from "@/features/kra/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Presets are platform-wide, authored only by platform admins -- writes
// always go through systemDb (the privileged, non-RLS connection), never
// the tenant-scoped `db`. See db/migrations for the RLS policy that makes
// this table read-only for every tenant.
export async function createKraTemplatePreset(
  createdBy: string,
  input: CreateKraTemplatePresetInput,
): Promise<KraTemplatePreset> {
  const result = createKraTemplatePresetSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid preset data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [preset] = await systemDb
      .insert(kraTemplatePresets)
      .values({ ...result.data, createdBy })
      .returning();

    return preset;
  } catch (error) {
    translateDatabaseError(error);
  }
}
