import { RateLimitError } from "@/lib/errors";

import { checkRateLimit } from "./in-memory-rate-limiter";
import { getClientIp } from "./get-client-ip";

// Per-IP, applied uniformly to every API route via routeHandler /
// fileRouteHandler. Deliberately generous: this is a coarse backstop
// against runaway clients and scripted abuse, not a precise per-user quota
// -- an office behind one NAT'd IP shares a bucket, so keep this loose
// enough that normal shared-office traffic never trips it.
const LIMIT = 300;
const WINDOW_MS = 60_000;

export function enforceRateLimit(request: Request): void {
  const ip = getClientIp(request);
  const result = checkRateLimit(`ip:${ip}`, LIMIT, WINDOW_MS);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds);
  }
}
