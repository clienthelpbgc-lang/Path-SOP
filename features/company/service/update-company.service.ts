import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { companies } from "@/features/company/schema";
import type { Company, UpdateCompanyInput } from "@/features/company/types";
import {
  companyIdSchema,
  updateCompanySchema,
} from "@/features/company/validation";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateCompany(
  id: string,
  input: UpdateCompanyInput,
): Promise<Company> {
  const idResult = companyIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid company id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const inputResult = updateCompanySchema.safeParse(input);

  if (!inputResult.success) {
    throw new ValidationError(
      "Invalid company data.",
      z.flattenError(inputResult.error).fieldErrors,
    );
  }

  try {
    const [company] = await db
      .update(companies)
      .set(inputResult.data)
      .where(eq(companies.id, idResult.data))
      .returning();

    if (!company) {
      throw new NotFoundError("Company not found.");
    }

    return company;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
