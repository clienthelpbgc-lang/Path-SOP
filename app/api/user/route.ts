// app/api/user/route.ts

import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createUser, getAllUsers } from "@/features/user/service";
import { getCurrentCompanyId } from "@/lib/session";

export const GET = routeHandler(async (request) => {
  const companyId = await getCurrentCompanyId();
  const { searchParams } = new URL(request.url);

  return getAllUsers(companyId, Object.fromEntries(searchParams.entries()));
});

export const POST = routeHandler(async (request) => {
  const companyId = await getCurrentCompanyId();
  const body = await request.json();

  return createUser(companyId, body);
});
