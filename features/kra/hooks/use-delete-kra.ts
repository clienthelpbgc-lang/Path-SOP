"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteKraRequest } from "@/features/kra/hooks/kra.api";
import { kraKeys } from "@/features/kra/hooks/kra.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteKra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKraRequest,
    onSuccess: (kra) => {
      queryClient.invalidateQueries({ queryKey: kraKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kraKeys.detail(kra.id) });
      toast.success(`"${kra.title}" was deleted successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete KRA. Please try again.",
      );
    },
  });
}
