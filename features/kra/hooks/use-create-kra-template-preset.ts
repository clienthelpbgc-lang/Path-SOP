"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createKraTemplatePresetRequest } from "@/features/kra/hooks/kra-template-preset.api";
import { kraTemplatePresetKeys } from "@/features/kra/hooks/kra-template-preset.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateKraTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKraTemplatePresetRequest,
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: kraTemplatePresetKeys.all });
      toast.success(`"${preset.name}" was created successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create preset. Please try again.",
      );
    },
  });
}
