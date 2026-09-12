import type { z } from "zod";

import type { updateKraTemplatePresetSchema } from "@/features/kra/validators";

export type UpdateKraTemplatePresetInput = z.infer<
  typeof updateKraTemplatePresetSchema
>;
