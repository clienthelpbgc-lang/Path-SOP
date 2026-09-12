"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { hardDeleteKraTemplateRequest } from "@/features/kra/hooks/kra-template.api";
import { kraTemplateKeys } from "@/features/kra/hooks/kra-template.keys";
import { ApiClientError } from "@/lib/api-client";

export function useHardDeleteKraTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteKraTemplateRequest,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: kraTemplateKeys.lists() });
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
