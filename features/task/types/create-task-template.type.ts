import type { z } from "zod";

import type { createTaskTemplateSchema } from "@/features/task/validators";

export type CreateTaskTemplateInput = z.infer<typeof createTaskTemplateSchema>;
