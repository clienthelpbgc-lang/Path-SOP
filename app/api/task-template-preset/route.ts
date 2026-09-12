import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  createTaskTemplatePreset,
  getAllTaskTemplatePresets,
} from "@/features/task/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

export const GET = routeHandler(async (request) => {
  await getCurrentPlatformAdmin();
  const { searchParams } = new URL(request.url);

  return getAllTaskTemplatePresets(Object.fromEntries(searchParams.entries()));
});

export const POST = routeHandler(async (request) => {
  const admin = await getCurrentPlatformAdmin();
  const body = await request.json();

  return createTaskTemplatePreset(admin.id, body);
});
