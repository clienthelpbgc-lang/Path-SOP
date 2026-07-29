import type { z } from "zod";

import type { createDailyTaskSchema } from "@/features/daily-task/validation";

export type CreateDailyTaskInput = z.infer<typeof createDailyTaskSchema>;
