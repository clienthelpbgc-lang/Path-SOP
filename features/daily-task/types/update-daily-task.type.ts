import type { z } from "zod";

import type { updateDailyTaskSchema } from "@/features/daily-task/validation";

export type UpdateDailyTaskInput = z.infer<typeof updateDailyTaskSchema>;
