import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publishableKey, secretKey, supabaseUrl } from "./keys";

let cached: SupabaseClient | null = null;

/** Client for the server-side billing, send and support functions that also check BILLING_SECRET.
 *  Uses the secret key when it is set (so those functions can later be closed to the public API),
 *  and falls back to the publishable key until then. Never import this into browser code. */
export function privileged(): SupabaseClient {
  if (!cached) cached = createClient(supabaseUrl(), secretKey() ?? publishableKey(), { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

/** True once the secret key is set, so the health check can report it. */
export const hasSecretKey = () => Boolean(secretKey());
