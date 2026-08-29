"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteCompanyRequest } from "@/features/company/hooks/company.api";
import { companyKeys } from "@/features/company/hooks/company.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompanyRequest,
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: companyKeys.detail(company.id),
      });
      toast.success(`"${company.name}" was deleted successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete company. Please try again.",
      );
    },
  });
}
