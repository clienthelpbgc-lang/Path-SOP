import { routeHandler } from "@/lib/route-helpers/route-handler";
import { deleteCompany, updateCompany } from "@/features/company/service";

type CompanyRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = routeHandler<unknown, CompanyRouteContext>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    return updateCompany(id, body);
  },
);

export const DELETE = routeHandler<unknown, CompanyRouteContext>(
  async (_request, context) => {
    const { id } = await context.params;

    return deleteCompany(id);
  },
);
