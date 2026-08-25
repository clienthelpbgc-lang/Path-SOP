import type { z } from "zod";

import type { updateTaskSchema } from "@/features/task/validators";

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
