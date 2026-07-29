import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  createDailyTask,
  getAllDailyTasks,
} from "@/features/daily-task/service";
import { getCurrentUser } from "@/lib/session";

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  return getAllDailyTasks(
    currentUser.companyId,
    Object.fromEntries(searchParams.entries()),
  );
});

export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return createDailyTask(currentUser.companyId, currentUser.id, body);
});
