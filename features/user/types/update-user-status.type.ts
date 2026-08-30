import type { z } from "zod";

import type { updateUserStatusSchema } from "@/features/user/validation";

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
