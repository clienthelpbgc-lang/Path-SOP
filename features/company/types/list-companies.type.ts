import type { z } from "zod";

import type { listCompaniesQuerySchema } from "@/features/company/validation";

export type ListCompaniesQueryInput = z.input<typeof listCompaniesQuerySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
