import type { z } from "zod";

import type { updateTaskChecklistItemSchema } from "@/features/task/validators";

export type UpdateTaskChecklistItemInput = z.infer<
  typeof updateTaskChecklistItemSchema
>;
