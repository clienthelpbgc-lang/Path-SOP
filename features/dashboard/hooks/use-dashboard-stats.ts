"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getDashboardStatsRequest } from "@/features/dashboard/hooks/dashboard-stats.api";
import { dashboardStatsKeys } from "@/features/dashboard/hooks/dashboard-stats.keys";
import type { DashboardPeriodKey } from "@/features/dashboard/types";

export function useDashboardStats(id: string, period: DashboardPeriodKey) {
  return useQuery({
    queryKey: dashboardStatsKeys.detail(id, period),
    queryFn: () => getDashboardStatsRequest(id, period),
    placeholderData: keepPreviousData,
  });
}
