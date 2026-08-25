"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteKraTemplateRequest } from "@/features/kra/hooks/kra-template.api";
import { kraTemplateKeys } from "@/features/kra/hooks/kra-template.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteKraTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKraTemplateRequest,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: kraTemplateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: kraTemplateKeys.detail(template.id),
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
