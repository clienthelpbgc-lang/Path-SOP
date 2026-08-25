import { createKra, getAllKras } from "@/features/kra/service";
import { getCurrentUser } from "@/lib/session";
import { routeHandler } from "@/lib/route-helpers/route-handler";

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  return getAllKras(
    currentUser.companyId,
    currentUser.id,
    currentUser.role,
    query,
  );
});

export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return createKra(
    currentUser.companyId,
    currentUser.id,
    currentUser.role,
    body,
  );
});
