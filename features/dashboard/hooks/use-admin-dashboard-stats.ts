"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getAdminDashboardStatsRequest } from "@/features/dashboard/hooks/admin-dashboard-stats.api";
import { adminDashboardStatsKeys } from "@/features/dashboard/hooks/admin-dashboard-stats.keys";
import type { DashboardPeriodKey } from "@/features/dashboard/types";

export function useAdminDashboardStats(period: DashboardPeriodKey) {
  return useQuery({
    queryKey: adminDashboardStatsKeys.detail(period),
    queryFn: () => getAdminDashboardStatsRequest(period),
    placeholderData: keepPreviousData,
  });
}
