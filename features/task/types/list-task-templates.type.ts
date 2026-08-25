import type { z } from "zod";

import type { listTaskTemplatesQuerySchema } from "@/features/task/validators";

export type ListTaskTemplatesQueryInput = z.input<
  typeof listTaskTemplatesQuerySchema
>;
export type ListTaskTemplatesQuery = z.infer<
  typeof listTaskTemplatesQuerySchema
>;
