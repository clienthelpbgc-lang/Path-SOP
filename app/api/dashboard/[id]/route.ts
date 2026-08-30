import {
  getDashboardPeriod,
  getIndividualUserDashboardStats,
} from "@/features/dashboard/service";
import { ForbiddenError } from "@/lib/errors";
import { parsePeriodKey } from "@/lib/route-helpers/parse-period-key";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";

type DashboardRouteContext = {
  params: Promise<{ id: string }>;
};
export const GET = routeHandler<unknown, DashboardRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    if (currentUser.role !== "ADMIN" && id !== currentUser.id) {
      throw new ForbiddenError("You can only view your own dashboard.");
    }

    const { searchParams } = new URL(request.url);
    const periodKey = parsePeriodKey(searchParams.get("period") ?? "last_week");
    const period = getDashboardPeriod(periodKey);

    return getIndividualUserDashboardStats(currentUser.companyId, id, period);
  },
);
