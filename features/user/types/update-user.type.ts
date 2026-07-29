import type { z } from "zod";

import type { updateUserSchema } from "@/features/user/validation";

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
