import type { z } from "zod";

import type { updateCompanySchema } from "@/features/company/validation";

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
