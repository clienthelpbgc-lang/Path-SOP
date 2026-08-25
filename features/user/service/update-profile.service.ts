import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/features/user/schema";
import type { NewUser, UpdateProfileInput, User } from "@/features/user/types";
import { updateProfileSchema } from "@/features/user/validation";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<User> {
  const result = updateProfileSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid profile data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { name, phone } = result.data;

  const updateValues: Partial<NewUser> = {};

  if (name !== undefined) updateValues.name = name;
  if (phone !== undefined) updateValues.phone = phone === "" ? null : phone;

  try {
    const [updated] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw new NotFoundError("User not found.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
