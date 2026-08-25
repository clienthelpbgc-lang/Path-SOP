"use client";

import { useMutation } from "@tanstack/react-query";

import { uploadTaskAttachmentRequest } from "@/features/task/hooks/task.api";

export function useUploadTaskAttachment() {
  return useMutation({
    mutationFn: uploadTaskAttachmentRequest,
  });
}
