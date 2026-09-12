import { routeHandler } from "@/lib/route-helpers/route-handler";
import { hardDeleteKraTemplate } from "@/features/kra/service";
import { getCurrentUser } from "@/lib/session";

type KraTemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = routeHandler<unknown, KraTemplateRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return hardDeleteKraTemplate(currentUser.companyId, currentUser.role, id);
  },
);
