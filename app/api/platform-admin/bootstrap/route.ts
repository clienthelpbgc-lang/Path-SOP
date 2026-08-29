import { assertValidPlatformSetupSecret } from "@/lib/route-helpers/assert-platform-setup-secret";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createPlatformAdmin } from "@/features/platform-admin/service/create-platform-admin.service";

export const POST = routeHandler(async (request) => {
  assertValidPlatformSetupSecret(request);

  const body = await request.json();

  return createPlatformAdmin(body);
});
