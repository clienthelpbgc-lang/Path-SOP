import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteTaskTemplatePreset,
  updateTaskTemplatePreset,
} from "@/features/task/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

type TaskTemplatePresetRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = routeHandler<unknown, TaskTemplatePresetRouteContext>(
  async (request, context) => {
    await getCurrentPlatformAdmin();
    const { id } = await context.params;
    const body = await request.json();

    return updateTaskTemplatePreset(id, body);
  },
);

export const DELETE = routeHandler<unknown, TaskTemplatePresetRouteContext>(
  async (_request, context) => {
    await getCurrentPlatformAdmin();
    const { id } = await context.params;

    return deleteTaskTemplatePreset(id);
  },
);
