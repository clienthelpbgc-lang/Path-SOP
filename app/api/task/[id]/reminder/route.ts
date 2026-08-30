import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createTaskReminder } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskReminderCollectionRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = routeHandler<unknown, TaskReminderCollectionRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return createTaskReminder(currentUser.companyId, currentUser.id, id, body);
  },
);
