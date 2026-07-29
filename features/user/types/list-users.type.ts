import type { z } from "zod";

import type { listUsersQuerySchema } from "@/features/user/validation";

export type ListUsersQueryInput = z.input<typeof listUsersQuerySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
