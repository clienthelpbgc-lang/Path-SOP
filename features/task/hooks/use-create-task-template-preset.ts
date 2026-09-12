"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTaskTemplatePresetRequest } from "@/features/task/hooks/task-template-preset.api";
import { taskTemplatePresetKeys } from "@/features/task/hooks/task-template-preset.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateTaskTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskTemplatePresetRequest,
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: taskTemplatePresetKeys.all });
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
