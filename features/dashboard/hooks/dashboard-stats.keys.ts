import type { DashboardPeriodKey } from "@/features/dashboard/types";

export const dashboardStatsKeys = {
  all: ["dashboard-stats"] as const,
  detail: (id: string, period: DashboardPeriodKey) =>
    [...dashboardStatsKeys.all, id, period] as const,
};
