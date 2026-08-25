"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateKraRequest } from "@/features/kra/hooks/kra.api";
import { kraKeys } from "@/features/kra/hooks/kra.keys";
import type { UpdateKraInput } from "@/features/kra/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateKraVariables = {
  id: string;
  input: UpdateKraInput;
};

export function useUpdateKra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateKraVariables) =>
      updateKraRequest(id, input),
    onSuccess: (kra) => {
      queryClient.invalidateQueries({ queryKey: kraKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kraKeys.detail(kra.id) });
      toast.success(`"${kra.title}" was updated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update KRA. Please try again.",
      );
    },
  });
}
