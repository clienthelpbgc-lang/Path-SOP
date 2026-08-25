"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getPeriodPerformanceRequest } from "@/features/dashboard/hooks/period-performance.api";
import { periodPerformanceKeys } from "@/features/dashboard/hooks/period-performance.keys";
import type { DashboardPeriodKey } from "@/features/dashboard/types";

export function usePeriodPerformance(
  period: DashboardPeriodKey,
  userId?: string,
) {
  return useQuery({
    queryKey: periodPerformanceKeys.detail(period, userId),
    queryFn: () => getPeriodPerformanceRequest(period, userId),
    placeholderData: keepPreviousData,
  });
}
