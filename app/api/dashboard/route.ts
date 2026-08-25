import { getDashboardOverview } from "@/features/dashboard/service";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";

export const GET = routeHandler(async () => {
  const currentUser = await getCurrentUser();

  return getDashboardOverview(currentUser.companyId, currentUser.id);
});
