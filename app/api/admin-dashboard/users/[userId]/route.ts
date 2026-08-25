import { getAdminUserOverview } from "@/features/dashboard/service";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";

type UserOverviewRouteContext = {
  params: Promise<{ userId: string }>;
};

export const GET = routeHandler<unknown, UserOverviewRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { userId } = await context.params;

    return getAdminUserOverview(currentUser.companyId, currentUser.role, userId);
  },
);
