import { routeHandler } from "@/lib/route-helpers/route-handler";
import { deleteUser, updateUserRole, updateUserStatus } from "@/features/user/service";
import { getCurrentUser } from "@/lib/session";

type UserRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = routeHandler<unknown, UserRouteContext>(
  async (request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;
    const body = await request.json();

    if (typeof body === "object" && body !== null && "isActive" in body) {
      return updateUserStatus(
        currentUser.companyId,
        currentUser.id,
        currentUser.role,
        id,
        body,
      );
    }

    return updateUserRole(
      currentUser.companyId,
      currentUser.id,
      currentUser.role,
      id,
      body,
    );
  },
);

export const DELETE = routeHandler<unknown, UserRouteContext>(
  async (_request, context) => {
    const currentUser = await getCurrentUser();
    const { id } = await context.params;

    return deleteUser(
      currentUser.companyId,
      currentUser.id,
      currentUser.role,
      id,
    );
  },
);
