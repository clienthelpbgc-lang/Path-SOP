"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateUserRoleRequest } from "@/features/user/hooks/user.api";
import { userKeys } from "@/features/user/hooks/user.keys";
import { ApiClientError } from "@/lib/api-client";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRoleRequest,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
      toast.success(
        `"${user.name}" is now ${user.role === "ADMIN" ? "an Admin" : "a User"}.`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update role. Please try again.",
      );
    },
  });
}
