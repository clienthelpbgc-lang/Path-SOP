"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { onboardTenantRequest } from "@/features/company/hooks/company.api";
import { companyKeys } from "@/features/company/hooks/company.keys";
import { ApiClientError } from "@/lib/api-client";

export function useOnboardTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onboardTenantRequest,
    onSuccess: ({ company }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success(`"${company.name}" was onboarded successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to onboard tenant. Please try again.",
      );
    },
  });
}
