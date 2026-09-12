"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteKraTemplatePresetRequest } from "@/features/kra/hooks/kra-template-preset.api";
import { kraTemplatePresetKeys } from "@/features/kra/hooks/kra-template-preset.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteKraTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKraTemplatePresetRequest,
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: kraTemplatePresetKeys.all });
      toast.success(`"${preset.name}" was deactivated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to deactivate preset. Please try again.",
      );
    },
  });
}
