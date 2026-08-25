import type { z } from "zod";

import type { listKraTemplatesQuerySchema } from "@/features/kra/validators";

export type ListKraTemplatesQueryInput = z.input<
  typeof listKraTemplatesQuerySchema
>;
export type ListKraTemplatesQuery = z.infer<
  typeof listKraTemplatesQuerySchema
>;
