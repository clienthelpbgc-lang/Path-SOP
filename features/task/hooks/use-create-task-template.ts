"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTaskTemplateRequest } from "@/features/task/hooks/task-template.api";
import { taskTemplateKeys } from "@/features/task/hooks/task-template.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskTemplateRequest,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: taskTemplateKeys.lists() });
      toast.success(`"${template.name}" was created successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create template. Please try again.",
      );
    },
  });
}
