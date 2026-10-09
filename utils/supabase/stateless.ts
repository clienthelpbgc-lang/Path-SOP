import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Anon-key client that never reads or writes cookies. For one-off auth
// calls (verifying a password, redeeming a reset token) whose resulting
// session must not replace the browser's own session.
export function createStatelessClient() {
  return createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
