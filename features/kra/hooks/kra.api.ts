import { apiFetch } from "@/lib/api-client";
import type {
  CreateKraInput,
  Kra,
  KraWithRelations,
  ListKrasQueryInput,
  UpdateKraInput,
} from "@/features/kra/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/kra";

function buildQueryString(query: ListKrasQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.set(key, value instanceof Date ? value.toISOString() : String(value));
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getKras(query: ListKrasQueryInput = {}) {
  return apiFetch<PaginatedResult<Kra>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function getKraRequest(id: string) {
  return apiFetch<KraWithRelations>(`${BASE_URL}/${id}`);
}

export function createKraRequest(input: CreateKraInput) {
  return apiFetch<Kra>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateKraRequest(id: string, input: UpdateKraInput) {
  return apiFetch<Kra>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKraRequest(id: string) {
  return apiFetch<Kra>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
