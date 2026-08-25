"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteTaskAttachmentRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

type DeleteTaskAttachmentVariables = {
  taskId: string;
  attachmentId: string;
};

export function useDeleteTaskAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: DeleteTaskAttachmentVariables) =>
      deleteTaskAttachmentRequest(taskId, attachmentId),
    onSuccess: (attachment) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(attachment.taskId),
      });
      toast.success("Attachment removed.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to remove the attachment. Please try again.",
      );
    },
  });
}
