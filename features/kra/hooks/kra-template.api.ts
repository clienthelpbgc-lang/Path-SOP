import { apiFetch } from "@/lib/api-client";
import type {
  CreateKraTemplateInput,
  KraTemplate,
  ListKraTemplatesQueryInput,
  UpdateKraTemplateInput,
} from "@/features/kra/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/kra-template";

function buildQueryString(query: ListKraTemplatesQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getKraTemplates(query: ListKraTemplatesQueryInput = {}) {
  return apiFetch<PaginatedResult<KraTemplate>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function createKraTemplateRequest(input: CreateKraTemplateInput) {
  return apiFetch<KraTemplate>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateKraTemplateRequest(
  id: string,
  input: UpdateKraTemplateInput,
) {
  return apiFetch<KraTemplate>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKraTemplateRequest(id: string) {
  return apiFetch<KraTemplate>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
