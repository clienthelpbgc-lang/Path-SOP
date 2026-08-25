import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteTaskTemplate,
  updateTaskTemplate,
} from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskTemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = routeHandler<unknown, TaskTemplateRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return updateTaskTemplate(currentUser.companyId, id, body);
  },
);

export const DELETE = routeHandler<unknown, TaskTemplateRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return deleteTaskTemplate(currentUser.companyId, id);
  },
);
