import { routeHandler } from "@/lib/route-helpers/route-handler";
import { deleteTaskWatcher } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskWatcherRouteContext = {
  params: Promise<{ id: string; watcherId: string }>;
};

export const DELETE = routeHandler<unknown, TaskWatcherRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id, watcherId } = await context.params;

    return deleteTaskWatcher(currentUser.companyId, currentUser.id, id, watcherId);
  },
);
