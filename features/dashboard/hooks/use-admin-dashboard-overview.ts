"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboardOverviewRequest } from "@/features/dashboard/hooks/admin-dashboard.api";
import { adminDashboardKeys } from "@/features/dashboard/hooks/admin-dashboard.keys";

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: adminDashboardKeys.overview(),
    queryFn: getAdminDashboardOverviewRequest,
  });
}
