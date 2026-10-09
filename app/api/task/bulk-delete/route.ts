import { routeHandler } from "@/lib/route-helpers/route-handler";
import { bulkDeleteTasks } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return bulkDeleteTasks(currentUser.companyId, currentUser.id, body);
});
