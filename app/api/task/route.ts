import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createTaskWithRelations, getAllTasks } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  // Only admins can list other users' tasks (the Task Admin page); everyone
  // else is pinned to their own, regardless of what `assignedTo` was passed.
  if (currentUser.role !== "ADMIN") {
    query.assignedTo = currentUser.id;
  }

  return getAllTasks(currentUser.companyId, query);
});

export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return createTaskWithRelations(currentUser.companyId, currentUser.id, body);
});
