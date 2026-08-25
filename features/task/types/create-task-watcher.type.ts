import type { z } from "zod";

import type { createTaskWatcherSchema } from "@/features/task/validators";

export type CreateTaskWatcherInput = z.infer<typeof createTaskWatcherSchema>;
