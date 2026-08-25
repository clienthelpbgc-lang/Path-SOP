import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  createTaskTemplate,
  getAllTaskTemplates,
} from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  return getAllTaskTemplates(
    currentUser.companyId,
    Object.fromEntries(searchParams.entries()),
  );
});

export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return createTaskTemplate(currentUser.companyId, currentUser.id, body);
});
