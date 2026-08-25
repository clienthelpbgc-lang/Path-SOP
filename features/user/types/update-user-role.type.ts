import type { z } from "zod";

import type { updateUserRoleSchema } from "@/features/user/validation";

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
