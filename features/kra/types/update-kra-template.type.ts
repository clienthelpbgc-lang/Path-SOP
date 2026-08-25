import type { z } from "zod";

import type { updateKraTemplateSchema } from "@/features/kra/validators";

export type UpdateKraTemplateInput = z.infer<typeof updateKraTemplateSchema>;
