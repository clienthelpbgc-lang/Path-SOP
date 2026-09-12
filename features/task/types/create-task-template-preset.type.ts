import type { z } from "zod";

import type { createTaskTemplatePresetSchema } from "@/features/task/validators";

export type CreateTaskTemplatePresetInput = z.infer<
  typeof createTaskTemplatePresetSchema
>;
