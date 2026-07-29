export function getTodayRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export function formatAssignedAt(value: string | Date) {
  // Fixed locale, not `undefined`: the server and browser can have different
  // default locales (e.g. lowercase vs uppercase "am"/"pm"), which causes a
  // hydration mismatch since this runs during SSR too.
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
