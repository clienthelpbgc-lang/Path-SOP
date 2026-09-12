"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteTaskTemplatePresetRequest } from "@/features/task/hooks/task-template-preset.api";
import { taskTemplatePresetKeys } from "@/features/task/hooks/task-template-preset.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteTaskTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskTemplatePresetRequest,
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: taskTemplatePresetKeys.all });
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
