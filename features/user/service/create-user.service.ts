import { z } from "zod";

import { db } from "@/db";
import { users } from "@/features/user/schema";
import type { CreateUserInput, User } from "@/features/user/types";
import { createUserSchema } from "@/features/user/validation";
import {
  InternalError,
  ValidationError,
  translateDatabaseError,
  translateSupabaseAuthError,
} from "@/lib/errors";
import { createAdminClient } from "@/utils/supabase/admin";

export async function createUser(
  companyId: string,
  input: CreateUserInput,
): Promise<User> {
  const result = createUserSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid user data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { password, name, email, phone, role, isActive } = result.data;

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
    const [user] = await db
      .insert(users)
      .values({
        id: authUserId,
        companyId,
        name,
        email,
        phone,
        role,
        isActive,
      })
      .returning();

    return user;
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    translateDatabaseError(error);
  }
}
