"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { changePasswordRequest } from "@/features/auth/hooks/auth.api";

// Errors are left to the caller: a wrong current password belongs inline on
// that field rather than in a toast.
export function useChangePassword() {
  return useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      toast.success(
        "Your password was changed. Other devices have been signed out.",
      );
    },
  });
}
