import type { z } from "zod";

import type { createKraTemplateSchema } from "@/features/kra/validators";

export type CreateKraTemplateInput = z.infer<typeof createKraTemplateSchema>;
