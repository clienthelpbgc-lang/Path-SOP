import type { z } from "zod";

import type { updateTaskReminderSchema } from "@/features/task/validators";

export type UpdateTaskReminderInput = z.infer<typeof updateTaskReminderSchema>;
