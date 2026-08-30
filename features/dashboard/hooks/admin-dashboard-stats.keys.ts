import type { DashboardPeriodKey } from "@/features/dashboard/types";

export const adminDashboardStatsKeys = {
  all: ["admin-dashboard-stats"] as const,
  detail: (period: DashboardPeriodKey) =>
    [...adminDashboardStatsKeys.all, period] as const,
};
