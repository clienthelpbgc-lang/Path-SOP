"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { hardDeleteTaskTemplateRequest } from "@/features/task/hooks/task-template.api";
import { taskTemplateKeys } from "@/features/task/hooks/task-template.keys";
import { ApiClientError } from "@/lib/api-client";

export function useHardDeleteTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteTaskTemplateRequest,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: taskTemplateKeys.lists() });
      toast.success(`"${template.name}" was permanently deleted.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete template. Please try again.",
      );
    },
  });
}
