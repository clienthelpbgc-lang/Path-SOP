import type { z } from "zod";

import type { updateTaskTemplateSchema } from "@/features/task/validators";

export type UpdateTaskTemplateInput = z.infer<typeof updateTaskTemplateSchema>;
