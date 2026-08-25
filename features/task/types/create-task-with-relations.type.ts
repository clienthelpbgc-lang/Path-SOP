import type { z } from "zod";

import type { createTaskWithRelationsSchema } from "@/features/task/validators";

export type CreateTaskWithRelationsInput = z.infer<
  typeof createTaskWithRelationsSchema
>;
