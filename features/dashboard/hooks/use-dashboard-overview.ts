"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardOverviewRequest } from "@/features/dashboard/hooks/dashboard.api";
import { dashboardKeys } from "@/features/dashboard/hooks/dashboard.keys";

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboardOverviewRequest,
  });
}
