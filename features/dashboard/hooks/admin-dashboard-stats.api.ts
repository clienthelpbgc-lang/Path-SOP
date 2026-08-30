import type {
  AdminDashboardStats,
  DashboardPeriodKey,
} from "@/features/dashboard/types";
import { apiFetch } from "@/lib/api-client";

export function getAdminDashboardStatsRequest(period: DashboardPeriodKey) {
  const searchParams = new URLSearchParams({ period });

  return apiFetch<AdminDashboardStats>(
    `/api/admin-dashboard?${searchParams.toString()}`,
  );
}
