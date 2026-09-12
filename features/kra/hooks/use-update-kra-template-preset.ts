"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateKraTemplatePresetRequest } from "@/features/kra/hooks/kra-template-preset.api";
import { kraTemplatePresetKeys } from "@/features/kra/hooks/kra-template-preset.keys";
import type { UpdateKraTemplatePresetInput } from "@/features/kra/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateKraTemplatePresetVariables = {
  id: string;
  input: UpdateKraTemplatePresetInput;
};

export function useUpdateKraTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateKraTemplatePresetVariables) =>
      updateKraTemplatePresetRequest(id, input),
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: kraTemplatePresetKeys.all });
      toast.success(`"${preset.name}" was updated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update preset. Please try again.",
      );
    },
  });
}
