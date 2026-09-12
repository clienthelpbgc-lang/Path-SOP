"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { hardDeleteTaskTemplatePresetRequest } from "@/features/task/hooks/task-template-preset.api";
import { taskTemplatePresetKeys } from "@/features/task/hooks/task-template-preset.keys";
import { ApiClientError } from "@/lib/api-client";

export function useHardDeleteTaskTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteTaskTemplatePresetRequest,
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: taskTemplatePresetKeys.all });
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
