import {
  getAdminDashboardStats,
  getDashboardPeriod,
} from "@/features/dashboard/service";
import { parsePeriodKey } from "@/lib/route-helpers/parse-period-key";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const periodKey = parsePeriodKey(searchParams.get("period") ?? "last_week");
  const period = getDashboardPeriod(periodKey);

  return getAdminDashboardStats(currentUser.companyId, currentUser.role, period);
});
