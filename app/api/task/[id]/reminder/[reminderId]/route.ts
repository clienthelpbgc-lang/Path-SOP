import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteTaskReminder,
  updateTaskReminder,
} from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

type TaskReminderRouteContext = {
  params: Promise<{ id: string; reminderId: string }>;
};

export const PATCH = routeHandler<unknown, TaskReminderRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id, reminderId } = await context.params;
    const body = await request.json();

    return updateTaskReminder(
      currentUser.companyId,
      currentUser.id,
      id,
      reminderId,
      body,
    );
  },
);

export const DELETE = routeHandler<unknown, TaskReminderRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id, reminderId } = await context.params;

    return deleteTaskReminder(currentUser.companyId, currentUser.id, id, reminderId);
  },
);
