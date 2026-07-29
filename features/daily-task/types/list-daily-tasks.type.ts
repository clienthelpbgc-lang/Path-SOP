import type { z } from "zod";

import type { listDailyTasksQuerySchema } from "@/features/daily-task/validation";

export type ListDailyTasksQueryInput = z.input<
  typeof listDailyTasksQuerySchema
>;
export type ListDailyTasksQuery = z.infer<typeof listDailyTasksQuerySchema>;
