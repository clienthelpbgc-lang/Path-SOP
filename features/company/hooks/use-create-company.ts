"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCompanyRequest } from "@/features/company/hooks/company.api";
import { companyKeys } from "@/features/company/hooks/company.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyRequest,
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success(`"${company.name}" was created successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create company. Please try again.",
      );
    },
  });
}
