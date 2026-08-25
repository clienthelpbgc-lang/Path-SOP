import { runInTenantScope } from "@/db/tenant-context";

import { handleError } from "./handle-error";
import { enforceRateLimit } from "@/lib/rate-limit/enforce-rate-limit";

// Same RLS-scoping contract as routeHandler (see route-handler.ts), but for
// routes that stream back a file instead of a JSON envelope -- the handler
// returns its own Response (e.g. a PDF with a Content-Disposition header)
// rather than having one built for it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fileRouteHandler<C = any>(
  handler: (request: Request, context: C) => Promise<Response>,
) {
  return async (request: Request, context: C) => {
    try {
      enforceRateLimit(request);

      return await runInTenantScope(() => handler(request, context));
    } catch (error) {
      return handleError(error);
    }
  };
}
