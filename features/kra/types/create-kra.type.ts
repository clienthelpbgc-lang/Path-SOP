import type { z } from "zod";

import type { createKraSchema } from "@/features/kra/validators";

export type CreateKraInput = z.infer<typeof createKraSchema>;
