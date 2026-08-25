// app/api/user/me/route.ts

import { routeHandler } from "@/lib/route-helpers/route-handler";
import { updateProfile } from "@/features/user/service";
import { getCurrentUser } from "@/lib/session";

export const PATCH = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return updateProfile(currentUser.id, body);
});
