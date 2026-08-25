import type { z } from "zod";

import type { updateProfileSchema } from "@/features/user/validation";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
