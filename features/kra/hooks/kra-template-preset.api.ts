import { apiFetch } from "@/lib/api-client";
import type {
  CreateKraTemplatePresetInput,
  KraTemplatePreset,
  ListKraTemplatePresetsQueryInput,
  UpdateKraTemplatePresetInput,
} from "@/features/kra/types";
import type { PaginatedResult } from "@/utils/types";

const ADMIN_BASE_URL = "/api/kra-template-preset";
const COMPANY_BASE_URL = "/api/company-kra-template-preset";

function buildQueryString(
  query: ListKraTemplatePresetsQueryInput = {},
): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getKraTemplatePresets(
  query: ListKraTemplatePresetsQueryInput = {},
) {
  return apiFetch<PaginatedResult<KraTemplatePreset>>(
    `${ADMIN_BASE_URL}${buildQueryString(query)}`,
  );
}

export function getCompanyKraTemplatePresets() {
  return apiFetch<KraTemplatePreset[]>(COMPANY_BASE_URL);
}

export function createKraTemplatePresetRequest(
  input: CreateKraTemplatePresetInput,
) {
  return apiFetch<KraTemplatePreset>(ADMIN_BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateKraTemplatePresetRequest(
  id: string,
  input: UpdateKraTemplatePresetInput,
) {
  return apiFetch<KraTemplatePreset>(`${ADMIN_BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKraTemplatePresetRequest(id: string) {
  return apiFetch<KraTemplatePreset>(`${ADMIN_BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export function hardDeleteKraTemplatePresetRequest(id: string) {
  return apiFetch<KraTemplatePreset>(`${ADMIN_BASE_URL}/${id}/permanent`, {
    method: "DELETE",
  });
}
