"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loginSchema } from "@/features/auth/validation";
import { createClient } from "@/utils/supabase/server";

export type LoginFormState =
  | {
      error: string;
    }
  | undefined;

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: "Please enter a valid email and password." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut();

  redirect("/login");
}
