import type {
  DashboardPeriodKey,
  PeriodPerformance,
} from "@/features/dashboard/types";
import { apiFetch } from "@/lib/api-client";

const BASE_URL = "/api/dashboard/period-performance";

export function getPeriodPerformanceRequest(
  period: DashboardPeriodKey,
  userId?: string,
) {
  const searchParams = new URLSearchParams({ period });
  if (userId) searchParams.set("userId", userId);

  return apiFetch<PeriodPerformance>(`${BASE_URL}?${searchParams.toString()}`);
}
