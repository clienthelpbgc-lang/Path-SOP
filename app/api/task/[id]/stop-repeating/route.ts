import { routeHandler } from "@/lib/route-helpers/route-handler";
import { stopRepeatingTask } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskRouteContext = { params: Promise<{ id: string }> };

export const POST = routeHandler<unknown, TaskRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return stopRepeatingTask(currentUser.companyId, currentUser.role, id);
  },
);
