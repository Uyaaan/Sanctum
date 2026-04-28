import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for server-only operations that must bypass RLS,
 * e.g., Vercel Cron tick fetching push subscriptions across all users.
 *
 * NEVER call this from a client component or expose it to the browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
