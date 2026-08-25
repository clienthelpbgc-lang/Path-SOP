import type { z } from "zod";

import type { createTaskAttachmentSchema } from "@/features/task/validators";

export type CreateTaskAttachmentInput = z.infer<
  typeof createTaskAttachmentSchema
>;
