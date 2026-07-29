import type { z } from "zod";

import type { createCompanySchema } from "@/features/company/validation";

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
