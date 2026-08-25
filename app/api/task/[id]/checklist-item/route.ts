import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createTaskChecklistItem } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskChecklistItemRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = routeHandler<unknown, TaskChecklistItemRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return createTaskChecklistItem(
      currentUser.companyId,
      currentUser.id,
      id,
      body,
    );
  },
);
