import { apiFetch } from "@/lib/api-client";
import type {
  Company,
  CompanyDetail,
  ListCompaniesQueryInput,
  OnboardTenantInput,
  OnboardTenantResult,
  UpdateCompanyInput,
} from "@/features/company/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/company";

function buildQueryString(query: ListCompaniesQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getCompanies(query: ListCompaniesQueryInput = {}) {
  return apiFetch<PaginatedResult<Company>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function onboardTenantRequest(input: OnboardTenantInput) {
  return apiFetch<OnboardTenantResult>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCompanyRequest(id: string) {
  return apiFetch<CompanyDetail>(`${BASE_URL}/${id}`);
}

export function updateCompanyRequest(id: string, input: UpdateCompanyInput) {
  return apiFetch<Company>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCompanyRequest(id: string) {
  return apiFetch<Company>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export type UploadedCompanyLogo = {
  fileKey: string;
  url: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
};

export function uploadCompanyLogoRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<UploadedCompanyLogo>(`${BASE_URL}/logo-upload`, {
    method: "POST",
    body: formData,
  });
}

export function deleteUploadedCompanyLogoRequest(fileKey: string) {
  return apiFetch<{ fileKey: string }>(
    `${BASE_URL}/logo-upload?fileKey=${encodeURIComponent(fileKey)}`,
    { method: "DELETE" },
  );
}
