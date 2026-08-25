"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateTaskTemplateRequest } from "@/features/task/hooks/task-template.api";
import { taskTemplateKeys } from "@/features/task/hooks/task-template.keys";
import type { UpdateTaskTemplateInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateTaskTemplateVariables = {
  id: string;
  input: UpdateTaskTemplateInput;
};

export function useUpdateTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTaskTemplateVariables) =>
      updateTaskTemplateRequest(id, input),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: taskTemplateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskTemplateKeys.detail(template.id),
      });
      toast.success(`"${template.name}" was updated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update template. Please try again.",
      );
    },
  });
}
