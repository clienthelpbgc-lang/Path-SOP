import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { companies } from "@/features/company/schema";
import type { CompanyDetail } from "@/features/company/types";
import { companyIdSchema } from "@/features/company/validation";
import { users } from "@/features/user/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function getCompanyById(id: string): Promise<CompanyDetail> {
  const idResult = companyIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid company id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const companyId = idResult.data;

  const [company] = await systemDb
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new NotFoundError("Company not found.");
  }

  const [[{ totalUsers }], [{ totalAdmins }]] = await Promise.all([
    systemDb
      .select({ totalUsers: count() })
      .from(users)
      .where(eq(users.companyId, companyId)),
    systemDb
      .select({ totalAdmins: count() })
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.role, "ADMIN"))),
  ]);

  return { ...company, totalUsers, totalAdmins };
}
