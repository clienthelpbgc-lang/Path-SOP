"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTaskAttachmentRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { CreateTaskAttachmentInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type CreateTaskAttachmentVariables = {
  taskId: string;
  input: Omit<CreateTaskAttachmentInput, "taskId">;
};

export function useCreateTaskAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: CreateTaskAttachmentVariables) =>
      createTaskAttachmentRequest(taskId, input),
    onSuccess: (attachment) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(attachment.taskId),
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to attach file. Please try again.",
      );
    },
  });
}
