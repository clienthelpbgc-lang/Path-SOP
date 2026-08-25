// Fixed-window counter, keyed by an arbitrary identity string (see
// get-client-ip.ts). In-memory and per-instance: on serverless deployments
// with multiple concurrent instances, each instance enforces its own
// window, so the *effective* limit is (limit x live instance count) rather
// than a hard global cap. That's an acceptable tradeoff for throttling
// runaway clients and casual abuse on an internal tool -- a precise
// cross-instance limit would need a shared store (e.g. Redis) instead.
type WindowEntry = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, WindowEntry>();

// Bounds memory on a long-lived Node process (e.g. `next dev`, or a
// non-serverless deploy) against unbounded growth from distinct identities.
// Serverless instances get recycled before this matters.
const MAX_TRACKED_IDENTITIES = 50_000;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || entry.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_IDENTITIES) {
      windows.clear();
    }

    windows.set(key, { count: 1, resetAt: now + windowMs });

    return { allowed: true };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;

  return { allowed: true };
}
