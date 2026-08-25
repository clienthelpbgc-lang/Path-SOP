import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createTaskWatcher } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskWatcherRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = routeHandler<unknown, TaskWatcherRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return createTaskWatcher(
      currentUser.companyId,
      currentUser.id,
      id,
      body.userId,
    );
  },
);
