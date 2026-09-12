import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  createKraTemplatePreset,
  getAllKraTemplatePresets,
} from "@/features/kra/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

export const GET = routeHandler(async (request) => {
  await getCurrentPlatformAdmin();
  const { searchParams } = new URL(request.url);

  return getAllKraTemplatePresets(Object.fromEntries(searchParams.entries()));
});

export const POST = routeHandler(async (request) => {
  const admin = await getCurrentPlatformAdmin();
  const body = await request.json();

  return createKraTemplatePreset(admin.id, body);
});
