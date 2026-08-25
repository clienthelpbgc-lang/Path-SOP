import type { z } from "zod";

import type { updateKraSchema } from "@/features/kra/validators";

export type UpdateKraInput = z.infer<typeof updateKraSchema>;
