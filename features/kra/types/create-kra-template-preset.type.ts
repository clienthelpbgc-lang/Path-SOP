import type { z } from "zod";

import type { createKraTemplatePresetSchema } from "@/features/kra/validators";

export type CreateKraTemplatePresetInput = z.infer<
  typeof createKraTemplatePresetSchema
>;
