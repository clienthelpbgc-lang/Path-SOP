import type { DashboardOverview } from "@/features/dashboard/types";
import { apiFetch } from "@/lib/api-client";

const BASE_URL = "/api/dashboard";

export function getDashboardOverviewRequest() {
  return apiFetch<DashboardOverview>(BASE_URL);
}
