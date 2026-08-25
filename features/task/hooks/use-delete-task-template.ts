"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteTaskTemplateRequest } from "@/features/task/hooks/task-template.api";
import { taskTemplateKeys } from "@/features/task/hooks/task-template.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskTemplateRequest,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: taskTemplateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskTemplateKeys.detail(template.id),
      });
      toast.success(`"${template.name}" was deactivated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to deactivate template. Please try again.",
      );
    },
  });
}
