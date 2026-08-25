"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteUserRequest } from "@/features/user/hooks/user.api";
import { userKeys } from "@/features/user/hooks/user.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(`"${user.name}" was deleted successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete user. Please try again.",
      );
    },
  });
}
