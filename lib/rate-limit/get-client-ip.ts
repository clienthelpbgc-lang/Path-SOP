// Netlify (and most edge proxies) append the real client IP as the first
// entry of x-forwarded-for; x-real-ip is a fallback some proxies set
// instead. Requests carrying neither (e.g. local dev, direct-to-origin)
// share one "unknown" bucket rather than bypassing the limit entirely.
export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}

// Same lookup for Server Actions, which get `headers()` rather than a Request.
export function getClientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  return "unknown";
}
