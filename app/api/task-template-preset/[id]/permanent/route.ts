import { routeHandler } from "@/lib/route-helpers/route-handler";
import { hardDeleteTaskTemplatePreset } from "@/features/task/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

type TaskTemplatePresetRouteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = routeHandler<unknown, TaskTemplatePresetRouteContext>(
  async (_request, context) => {
    await getCurrentPlatformAdmin();
    const { id } = await context.params;

    return hardDeleteTaskTemplatePreset(id);
  },
);
