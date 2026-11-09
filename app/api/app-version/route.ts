import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { publishableKey, supabaseUrl } from "@/lib/supabase/keys";

// The oldest phone app version still allowed, per platform. Read by UpdateGate when the app opens.
// Source: the app_settings table in Supabase (change it there, no deploy needed).
// MIN_SUPPORTED_APP_VERSION in Vercel overrides both platforms. Any error answers "0.0.0" so nobody is locked out.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const platform = new URL(req.url).searchParams.get("platform") === "android" ? "android" : "ios";
  let min = process.env.MIN_SUPPORTED_APP_VERSION || "";
  if (!min) {
    try {
      const sb = createClient(supabaseUrl(), publishableKey(), { auth: { persistSession: false } });
      const { data } = await sb.from("app_settings").select("value").eq("key", `min_supported_version_${platform}`).maybeSingle();
      min = data?.value || "";
    } catch {
      min = "";
    }
  }
  return NextResponse.json({ min: min || "0.0.0", platform }, { headers: { "Cache-Control": "no-store" } });
}
