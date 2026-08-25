import { routeHandler } from "@/lib/route-helpers/route-handler";
import { deleteTaskAttachment } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskAttachmentRouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export const DELETE = routeHandler<unknown, TaskAttachmentRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id, attachmentId } = await context.params;

    return deleteTaskAttachment(
      currentUser.companyId,
      currentUser.id,
      id,
      attachmentId,
    );
  },
);
