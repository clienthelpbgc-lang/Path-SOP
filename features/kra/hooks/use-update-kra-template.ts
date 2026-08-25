"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateKraTemplateRequest } from "@/features/kra/hooks/kra-template.api";
import { kraTemplateKeys } from "@/features/kra/hooks/kra-template.keys";
import type { UpdateKraTemplateInput } from "@/features/kra/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateKraTemplateVariables = {
  id: string;
  input: UpdateKraTemplateInput;
};

export function useUpdateKraTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateKraTemplateVariables) =>
      updateKraTemplateRequest(id, input),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: kraTemplateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: kraTemplateKeys.detail(template.id),
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
