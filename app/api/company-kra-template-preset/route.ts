import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getActiveKraTemplatePresets } from "@/features/kra/service";
import { getCurrentUser } from "@/lib/session";

// Tenant-facing read: only admins (same gating as the KRA Templates tab
// itself -- only admins assign KRAs). Write access lives only under
// /api/kra-template-preset, gated by getCurrentPlatformAdmin().
export const GET = routeHandler(async () => {
  const currentUser = await getCurrentUser();

  return getActiveKraTemplatePresets(currentUser.role);
});
