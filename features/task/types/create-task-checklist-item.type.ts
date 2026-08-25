import type { z } from "zod";

import type { createTaskChecklistItemSchema } from "@/features/task/validators";

export type CreateTaskChecklistItemInput = z.infer<
  typeof createTaskChecklistItemSchema
>;
