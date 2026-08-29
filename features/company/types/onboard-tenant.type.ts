import type { z } from "zod";

import type { Company } from "@/features/company/types/company.type";
import type { onboardTenantSchema } from "@/features/company/validation";
import type { User } from "@/features/user/types";

export type OnboardTenantInput = z.infer<typeof onboardTenantSchema>;

export type OnboardTenantResult = {
  company: Company;
  admin: User;
};
