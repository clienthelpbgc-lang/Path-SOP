import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteDailyTask,
  getDailyTaskById,
  updateDailyTask,
} from "@/features/daily-task/service";
import { getCurrentUser } from "@/lib/session";

type DailyTaskRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = routeHandler<unknown, DailyTaskRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return getDailyTaskById(currentUser.companyId, id);
  },
);

export const PATCH = routeHandler<unknown, DailyTaskRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return updateDailyTask(currentUser.companyId, currentUser.id, id, body);
  },
);

export const DELETE = routeHandler<unknown, DailyTaskRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return deleteDailyTask(currentUser.companyId, currentUser.id, id);
  },
);
