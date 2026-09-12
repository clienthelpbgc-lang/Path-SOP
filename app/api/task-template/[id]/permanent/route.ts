import { routeHandler } from "@/lib/route-helpers/route-handler";
import { hardDeleteTaskTemplate } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskTemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = routeHandler<unknown, TaskTemplateRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return hardDeleteTaskTemplate(currentUser.companyId, id);
  },
);
