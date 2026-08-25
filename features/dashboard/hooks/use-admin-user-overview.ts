"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminUserOverviewRequest } from "@/features/dashboard/hooks/admin-dashboard.api";
import { adminDashboardKeys } from "@/features/dashboard/hooks/admin-dashboard.keys";

export function useAdminUserOverview(userId: string) {
  return useQuery({
    queryKey: adminDashboardKeys.userOverview(userId),
    queryFn: () => getAdminUserOverviewRequest(userId),
  });
}
