// Netlify (and most edge proxies) append the real client IP as the first
// entry of x-forwarded-for; x-real-ip is a fallback some proxies set
// instead. Requests carrying neither (e.g. local dev, direct-to-origin)
// share one "unknown" bucket rather than bypassing the limit entirely.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  return "unknown";
}
