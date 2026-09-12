"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateTaskTemplatePresetRequest } from "@/features/task/hooks/task-template-preset.api";
import { taskTemplatePresetKeys } from "@/features/task/hooks/task-template-preset.keys";
import type { UpdateTaskTemplatePresetInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateTaskTemplatePresetVariables = {
  id: string;
  input: UpdateTaskTemplatePresetInput;
};

export function useUpdateTaskTemplatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTaskTemplatePresetVariables) =>
      updateTaskTemplatePresetRequest(id, input),
    onSuccess: (preset) => {
      queryClient.invalidateQueries({ queryKey: taskTemplatePresetKeys.all });
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
