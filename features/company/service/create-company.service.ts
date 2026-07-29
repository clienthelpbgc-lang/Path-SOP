import { z } from "zod";

import { db } from "@/db";
import { companies } from "@/features/company/schema";
import type { Company, CreateCompanyInput } from "@/features/company/types";
import { createCompanySchema } from "@/features/company/validation";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createCompany(
  input: CreateCompanyInput,
): Promise<Company> {
  const result = createCompanySchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid company data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const [company] = await db
      .insert(companies)
      .values(result.data)
      .returning();

    return company;
  } catch (error) {
    translateDatabaseError(error);
  }
}
