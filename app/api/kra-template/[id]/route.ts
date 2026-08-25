import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteKraTemplate,
  updateKraTemplate,
} from "@/features/kra/service";
import { getCurrentUser } from "@/lib/session";

type KraTemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = routeHandler<unknown, KraTemplateRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return updateKraTemplate(currentUser.companyId, currentUser.role, id, body);
  },
);

export const DELETE = routeHandler<unknown, KraTemplateRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return deleteKraTemplate(currentUser.companyId, currentUser.role, id);
  },
);
