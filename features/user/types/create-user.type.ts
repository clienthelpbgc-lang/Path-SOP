import type { z } from "zod";

import type { createUserSchema } from "@/features/user/validation";

export type CreateUserInput = z.infer<typeof createUserSchema>;
