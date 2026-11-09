import { createClient } from "@supabase/supabase-js";
import { publishableKey, supabaseUrl } from "@/lib/supabase/keys";

export type PublicWin = { id: string; category: string; amount: number | null; created_at: string };

/** A shared win, read with the public key (only the category and amount are readable). */
export async function getWin(id: string): Promise<PublicWin | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const sb = createClient(supabaseUrl(), publishableKey(), { auth: { persistSession: false } });
  const { data } = await sb.from("wins").select("id, category, amount, created_at").eq("id", id).maybeSingle();
  return (data as PublicWin) || null;
}
