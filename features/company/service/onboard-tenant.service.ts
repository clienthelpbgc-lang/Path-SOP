import { z } from "zod";

import { systemDb } from "@/db";
import { companies } from "@/features/company/schema";
import type { OnboardTenantInput, OnboardTenantResult } from "@/features/company/types";
import { onboardTenantSchema } from "@/features/company/validation";
import { users } from "@/features/user/schema";
import {
  InternalError,
  ValidationError,
  translateDatabaseError,
  translateSupabaseAuthError,
} from "@/lib/errors";
import { createAdminClient } from "@/utils/supabase/admin";

export async function onboardTenant(
  input: OnboardTenantInput,
): Promise<OnboardTenantResult> {
  const result = onboardTenantSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid tenant onboarding data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { admin, ...companyFields } = result.data;
  const supabaseAdmin = createAdminClient();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: { name: admin.name },
    });

  if (authError) {
    translateSupabaseAuthError(authError);
  }

  if (!authData.user) {
    throw new InternalError("Failed to create the tenant admin's authentication user.");
  }

  const authUserId = authData.user.id;

  try {
    return await systemDb.transaction(async (tx) => {
      const [company] = await tx
        .insert(companies)
        .values(companyFields)
        .returning();

      const [adminUser] = await tx
        .insert(users)
        .values({
          id: authUserId,
          companyId: company.id,
          name: admin.name,
          email: admin.email,
          role: "ADMIN",
        })
        .returning();

      return { company, admin: adminUser };
    });
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    translateDatabaseError(error);
  }
}
