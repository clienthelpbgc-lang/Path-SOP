"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateCompanyRequest } from "@/features/company/hooks/company.api";
import { companyKeys } from "@/features/company/hooks/company.keys";
import type { UpdateCompanyInput } from "@/features/company/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateCompanyVariables = {
  id: string;
  input: UpdateCompanyInput;
};

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateCompanyVariables) =>
      updateCompanyRequest(id, input),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: companyKeys.detail(company.id),
      });
      toast.success(`"${company.name}" was updated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update company. Please try again.",
      );
    },
  });
}
