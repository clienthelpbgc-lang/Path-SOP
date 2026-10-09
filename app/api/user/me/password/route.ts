import { routeHandler } from "@/lib/route-helpers/route-handler";
import { changePassword } from "@/features/auth/service/change-password.service";
import { getCurrentUser } from "@/lib/session";

export const PUT = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return changePassword(currentUser, body);
});
