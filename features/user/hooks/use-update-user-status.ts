"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateUserStatusRequest } from "@/features/user/hooks/user.api";
import { userKeys } from "@/features/user/hooks/user.keys";
import { ApiClientError } from "@/lib/api-client";

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserStatusRequest,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
      toast.success(
        `"${user.name}" is now ${user.isActive ? "active" : "inactive"}.`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update status. Please try again.",
      );
    },
  });
}
