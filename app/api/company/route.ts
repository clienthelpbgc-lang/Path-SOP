import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getAllCompanies, onboardTenant } from "@/features/company/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

export const GET = routeHandler(async (request) => {
  await getCurrentPlatformAdmin();

  const { searchParams } = new URL(request.url);

  return getAllCompanies(Object.fromEntries(searchParams.entries()));
});

export const POST = routeHandler(async (request) => {
  await getCurrentPlatformAdmin();

  const body = await request.json();

  return onboardTenant(body);
});
