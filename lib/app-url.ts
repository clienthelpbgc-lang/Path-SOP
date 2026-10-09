// Absolute base URL for links that leave the app (emails, WhatsApp).
// Deliberately never derived from the incoming request's Host header: for
// password-reset links that would let anyone trigger a reset email whose
// link points at a domain they control (host header poisoning).
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
}
