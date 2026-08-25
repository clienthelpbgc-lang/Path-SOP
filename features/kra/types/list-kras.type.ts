import type { z } from "zod";

import type { listKrasQuerySchema } from "@/features/kra/validators";

export type ListKrasQueryInput = z.input<typeof listKrasQuerySchema>;
export type ListKrasQuery = z.infer<typeof listKrasQuerySchema>;
