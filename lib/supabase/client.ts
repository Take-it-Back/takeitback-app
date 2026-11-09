"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publishableKey, supabaseUrl } from "@/lib/supabase/keys";

export function createClient() {
  return createBrowserClient(
    supabaseUrl(),
    publishableKey()
  );
}
