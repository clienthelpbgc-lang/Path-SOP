import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  deleteCompany,
  getCompanyById,
  updateCompany,
} from "@/features/company/service";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";

type CompanyRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = routeHandler<unknown, CompanyRouteContext>(
  async (_request, context) => {
    await getCurrentPlatformAdmin();

    const { id } = await context.params;

    return getCompanyById(id);
  },
);

export const PATCH = routeHandler<unknown, CompanyRouteContext>(
  async (request, context) => {
    await getCurrentPlatformAdmin();

    const { id } = await context.params;
    const body = await request.json();

    return updateCompany(id, body);
  },
);

export const DELETE = routeHandler<unknown, CompanyRouteContext>(
  async (_request, context) => {
    await getCurrentPlatformAdmin();

    const { id } = await context.params;

    return deleteCompany(id);
  },
);
