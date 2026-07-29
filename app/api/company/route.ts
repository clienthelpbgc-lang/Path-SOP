import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createCompany, getAllCompanies } from "@/features/company/service";

export const GET = routeHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  return getAllCompanies(Object.fromEntries(searchParams.entries()));
});

export const POST = routeHandler(async (request) => {
  const body = await request.json();

  return createCompany(body);
});
