import type { z } from "zod";

import type { createTaskReminderSchema } from "@/features/task/validators";

export type CreateTaskReminderInput = z.infer<typeof createTaskReminderSchema>;
