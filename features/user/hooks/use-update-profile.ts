"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateProfileRequest } from "@/features/user/hooks/user.api";
import { userKeys } from "@/features/user/hooks/user.keys";
import { ApiClientError } from "@/lib/api-client";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("Your profile was updated successfully.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update your profile. Please try again.",
      );
    },
  });
}
