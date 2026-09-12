import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getActiveTaskTemplatePresets } from "@/features/task/service";
import { getCurrentUser } from "@/lib/session";

// Tenant-facing read: any authenticated company user can browse the
// platform-wide preset library. Write access lives only under
// /api/task-template-preset, gated by getCurrentPlatformAdmin().
export const GET = routeHandler(async () => {
  await getCurrentUser();

  return getActiveTaskTemplatePresets();
});
