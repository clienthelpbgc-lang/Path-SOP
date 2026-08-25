import { deleteKra, getKraById, updateKra } from "@/features/kra/service";
import { getCurrentUser } from "@/lib/session";
import { routeHandler } from "@/lib/route-helpers/route-handler";

type KraRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = routeHandler<unknown, KraRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return getKraById(
      currentUser.companyId,
      currentUser.id,
      currentUser.role,
      id,
    );
  },
);

export const PATCH = routeHandler<unknown, KraRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    return updateKra(
      currentUser.companyId,
      currentUser.id,
      currentUser.role,
      id,
      body,
    );
  },
);

export const DELETE = routeHandler<unknown, KraRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return deleteKra(currentUser.companyId, currentUser.id, currentUser.role, id);
  },
);
