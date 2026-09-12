import type { z } from "zod";

import type { listTaskTemplatePresetsQuerySchema } from "@/features/task/validators";

export type ListTaskTemplatePresetsQueryInput = z.input<
  typeof listTaskTemplatePresetsQuerySchema
>;
export type ListTaskTemplatePresetsQuery = z.infer<
  typeof listTaskTemplatePresetsQuerySchema
>;
