"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { hardDeleteKraTemplatePresetRequest } from "@/features/kra/hooks/kra-template-preset.api";
import { kraTemplatePresetKeys } from "@/features/kra/hooks/kra-template-preset.keys";
import { ApiClientError } from "@/lib/api-client";

export function useHardDeleteKraTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteKraTemplatePresetRequest,
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: kraTemplatePresetKeys.all });
      toast.success(`"${preset.name}" was permanently deleted.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete preset. Please try again.",
      );
    },
  });
}
