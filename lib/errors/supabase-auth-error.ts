import type { AuthError } from "@supabase/supabase-js";

import { ConflictError, ValidationError } from ".";

export function translateSupabaseAuthError(error: AuthError): never {
  switch (error.code) {
    case "email_exists":
    case "user_already_exists":
      throw new ConflictError("A user with this email already exists.");
    case "weak_password":
      throw new ValidationError(
        "Password does not meet the required strength.",
      );
    case "email_address_invalid":
      throw new ValidationError("Please provide a valid email address.");
    case "validation_failed":
      throw new ValidationError(error.message);
  }
  throw error;
}
