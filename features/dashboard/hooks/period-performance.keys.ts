import type { DashboardPeriodKey } from "@/features/dashboard/types";

export const periodPerformanceKeys = {
  all: ["period-performance"] as const,
  detail: (period: DashboardPeriodKey, userId?: string) =>
    [...periodPerformanceKeys.all, period, userId ?? "self"] as const,
};
