import { routeHandler } from "@/lib/route-helpers/route-handler";
import { hardDeleteKraTemplatePreset } from "@/features/kra/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

type KraTemplatePresetRouteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = routeHandler<unknown, KraTemplatePresetRouteContext>(
  async (_request, context) => {
    await getCurrentPlatformAdmin();
    const { id } = await context.params;

    return hardDeleteKraTemplatePreset(id);
  },
);
