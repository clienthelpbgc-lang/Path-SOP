import type { z } from "zod";

import type { listKraTemplatePresetsQuerySchema } from "@/features/kra/validators";

export type ListKraTemplatePresetsQueryInput = z.input<
  typeof listKraTemplatePresetsQuerySchema
>;
export type ListKraTemplatePresetsQuery = z.infer<
  typeof listKraTemplatePresetsQuerySchema
>;
