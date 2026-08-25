"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createKraRequest } from "@/features/kra/hooks/kra.api";
import { kraKeys } from "@/features/kra/hooks/kra.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateKra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKraRequest,
    onSuccess: (kra) => {
      queryClient.invalidateQueries({ queryKey: kraKeys.lists() });
      toast.success(`"${kra.title}" was assigned successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to assign KRA. Please try again.",
      );
    },
  });
}
