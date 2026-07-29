"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createUserRequest } from "@/features/user/hooks/user.api";
import { userKeys } from "@/features/user/hooks/user.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserRequest,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(`"${user.name}" was created successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create user. Please try again.",
      );
    },
  });
}
