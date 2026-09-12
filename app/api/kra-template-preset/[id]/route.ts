import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteKraTemplatePreset,
  updateKraTemplatePreset,
} from "@/features/kra/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

type KraTemplatePresetRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = routeHandler<unknown, KraTemplatePresetRouteContext>(
  async (request, context) => {
    await getCurrentPlatformAdmin();
    const { id } = await context.params;
    const body = await request.json();

    return updateKraTemplatePreset(id, body);
  },
);

export const DELETE = routeHandler<unknown, KraTemplatePresetRouteContext>(
  async (_request, context) => {
    await getCurrentPlatformAdmin();
    const { id } = await context.params;

    return deleteKraTemplatePreset(id);
  },
);
