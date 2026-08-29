// Public bucket -- unlike task-attachments, a company's logo is rendered
// directly as an <img src> (Header/SidebarContent AvatarImage) wherever the
// tenant's branding shows up, so the stored URL has to be fetchable without
// a signed-URL round trip. Create this bucket once in the Supabase dashboard
// (Storage -> New bucket -> "company-logos", Public bucket ON) before using
// the upload route below.
export const COMPANY_LOGO_BUCKET = "company-logos";

export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;
