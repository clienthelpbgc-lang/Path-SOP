"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createKraTemplateRequest } from "@/features/kra/hooks/kra-template.api";
import { kraTemplateKeys } from "@/features/kra/hooks/kra-template.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateKraTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKraTemplateRequest,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: kraTemplateKeys.lists() });
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
