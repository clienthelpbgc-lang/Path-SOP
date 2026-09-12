import type { z } from "zod";

import type { updateTaskTemplatePresetSchema } from "@/features/task/validators";

export type UpdateTaskTemplatePresetInput = z.infer<
  typeof updateTaskTemplatePresetSchema
>;
