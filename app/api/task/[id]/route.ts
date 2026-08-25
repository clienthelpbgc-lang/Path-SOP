import { routeHandler } from "@/lib/route-helpers/route-handler";
import { deleteTask, getTaskById, updateTask } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = routeHandler<unknown, TaskRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return getTaskById(currentUser.companyId, id);
  },
);

export const PATCH = routeHandler<unknown, TaskRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return updateTask(currentUser.companyId, currentUser.id, id, body);
  },
);

export const DELETE = routeHandler<unknown, TaskRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return deleteTask(currentUser.companyId, currentUser.id, id);
  },
);
