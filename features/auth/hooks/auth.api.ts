import { apiFetch } from "@/lib/api-client";
import type { ChangePasswordInput } from "@/features/auth/validation";

export function changePasswordRequest(input: ChangePasswordInput) {
  return apiFetch<{ changed: true }>("/api/user/me/password", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
