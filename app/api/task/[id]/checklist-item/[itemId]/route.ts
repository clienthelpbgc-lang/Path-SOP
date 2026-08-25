import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteTaskChecklistItem,
  updateTaskChecklistItem,
} from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskChecklistItemRouteContext = {
  params: Promise<{ id: string; itemId: string }>;
};

export const PATCH = routeHandler<unknown, TaskChecklistItemRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id, itemId } = await context.params;
    const body = await request.json();

    return updateTaskChecklistItem(
      currentUser.companyId,
      currentUser.id,
      id,
      itemId,
      body,
    );
  },
);

export const DELETE = routeHandler<unknown, TaskChecklistItemRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id, itemId } = await context.params;

    return deleteTaskChecklistItem(
      currentUser.companyId,
      currentUser.id,
      id,
      itemId,
    );
  },
);
