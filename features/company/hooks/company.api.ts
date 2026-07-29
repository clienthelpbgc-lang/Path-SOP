import { apiFetch } from "@/lib/api-client";
import type {
  Company,
  CreateCompanyInput,
  ListCompaniesQueryInput,
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

export function createCompanyRequest(input: CreateCompanyInput) {
  return apiFetch<Company>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
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
