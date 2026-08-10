import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

/**
 * The one Supabase client the frontend ever creates, built from the public
 * URL and anon/publishable key only (never the service-role key — that
 * stays server-only, see `backend/src/services/supabase.service.ts`).
 *
 * Returns `null` if Supabase isn't configured yet
 * (`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` unset) —
 * every caller treats that as "auth isn't available", so the app keeps
 * working exactly as it did before this feature existed until Supabase is
 * actually wired up.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  client = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  return client;
}
