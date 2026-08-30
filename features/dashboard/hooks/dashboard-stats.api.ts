import type {
  DashboardPeriodKey,
  IndividualUserDashboardStats,
} from "@/features/dashboard/types";
import { apiFetch } from "@/lib/api-client";

export function getDashboardStatsRequest(
  id: string,
  period: DashboardPeriodKey,
) {
  const searchParams = new URLSearchParams({ period });

  return apiFetch<IndividualUserDashboardStats>(
    `/api/dashboard/${id}?${searchParams.toString()}`,
  );
}
