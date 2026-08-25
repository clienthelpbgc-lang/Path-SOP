import { runInTenantScope } from "@/db/tenant-context";

import { handleError } from "./handle-error";
import { enforceRateLimit } from "@/lib/rate-limit/enforce-rate-limit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function routeHandler<T, C = any>(
  handler: (request: Request, context: C) => Promise<T>,
) {
  return async (request: Request, context: C) => {
    try {
      enforceRateLimit(request);

      // Opens the RLS-scoped transaction for the whole request, before auth
      // is even resolved -- getCurrentUser() (always the handler's first
      // call) sets the app.user_id session variable on it, and every
      // service call after that reuses the same transaction/scope. See
      // db/tenant-context.ts.
      const data = await runInTenantScope(() => handler(request, context));

      return Response.json({
        success: true,
        data,
      });
    } catch (error) {
      return handleError(error);
    }
  };
}
