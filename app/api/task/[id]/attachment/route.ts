import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createTaskAttachment } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskAttachmentRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = routeHandler<unknown, TaskAttachmentRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return createTaskAttachment(currentUser.companyId, currentUser.id, id, body);
  },
);
