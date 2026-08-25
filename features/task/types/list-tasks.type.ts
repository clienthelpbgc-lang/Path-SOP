import type { z } from "zod";

import type { listTasksQuerySchema } from "@/features/task/validators";

export type ListTasksQueryInput = z.input<typeof listTasksQuerySchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
