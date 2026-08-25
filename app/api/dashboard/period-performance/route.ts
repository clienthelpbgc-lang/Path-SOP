import {
  DASHBOARD_PERIOD_KEYS,
  getDashboardPeriod,
  getPeriodPerformance,
  type DashboardPeriodKey,
} from "@/features/dashboard/service";
import { BadRequestError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";

function parsePeriodKey(value: string | null): DashboardPeriodKey {
  if (value && (DASHBOARD_PERIOD_KEYS as readonly string[]).includes(value)) {
    return value as DashboardPeriodKey;
  }

  throw new BadRequestError(
    `Invalid period. Expected one of: ${DASHBOARD_PERIOD_KEYS.join(", ")}.`,
  );
}

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const targetUserId = searchParams.get("userId") || currentUser.id;
  const periodKey = parsePeriodKey(searchParams.get("period") ?? "last_week");
  const period = getDashboardPeriod(periodKey);

  return getPeriodPerformance(
    currentUser.companyId,
    currentUser.id,
    currentUser.role,
    targetUserId,
    period,
  );
});
