import { z } from "zod";

import { systemDb } from "@/db";
import { platformAdmins } from "@/features/platform-admin/schema";
import type { PlatformAdmin } from "@/features/platform-admin/types";
import { createPlatformAdminSchema } from "@/features/platform-admin/validation";
import {
  InternalError,
  ValidationError,
  translateDatabaseError,
  translateSupabaseAuthError,
} from "@/lib/errors";
import { createAdminClient } from "@/utils/supabase/admin";

export type CreatePlatformAdminInput = z.infer<typeof createPlatformAdminSchema>;

export async function createPlatformAdmin(
  input: CreatePlatformAdminInput,
): Promise<PlatformAdmin> {
  const result = createPlatformAdminSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid platform admin data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { name, email, password } = result.data;
  const supabaseAdmin = createAdminClient();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (authError) {
    translateSupabaseAuthError(authError);
  }

  if (!authData.user) {
    throw new InternalError("Failed to create the authentication user.");
  }

  const authUserId = authData.user.id;

  try {
    const [admin] = await systemDb
      .insert(platformAdmins)
      .values({ id: authUserId, name, email })
      .returning();

    return admin;
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    translateDatabaseError(error);
  }
}
