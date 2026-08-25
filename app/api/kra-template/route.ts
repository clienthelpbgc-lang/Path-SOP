import { routeHandler } from "@/lib/route-helpers/route-handler";
import {
  createKraTemplate,
  getAllKraTemplates,
} from "@/features/kra/service";
import { getCurrentUser } from "@/lib/session";

export const GET = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  return getAllKraTemplates(
    currentUser.companyId,
    currentUser.role,
    Object.fromEntries(searchParams.entries()),
  );
});

export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const body = await request.json();

  return createKraTemplate(
    currentUser.companyId,
    currentUser.id,
    currentUser.role,
    body,
  );
});
