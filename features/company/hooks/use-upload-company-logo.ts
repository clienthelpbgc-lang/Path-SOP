"use client";

import { useMutation } from "@tanstack/react-query";

import { uploadCompanyLogoRequest } from "@/features/company/hooks/company.api";

export function useUploadCompanyLogo() {
  return useMutation({
    mutationFn: uploadCompanyLogoRequest,
  });
}
