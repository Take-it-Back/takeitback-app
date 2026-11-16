"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MarketingState = { ok?: string; error?: string };

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e)).replace(/^.*?ERROR:\s*/, "");

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.code === "42501" ? "Your role can't change marketing." : error.message);
  return data as T;
}

/** Splits one CSV line, allowing quoted fields with commas in them. */
function cells(line: string) {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") out.push(cur.trim()), (cur = "");
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}

const HEAD: Record<string, string> = {
  date: "date", day: "date", reporting_starts: "date",
  platform: "platform", network: "platform", source: "platform",
  campaign: "campaign", campaign_name: "campaign", utm_campaign: "campaign",
  spend: "spend", cost: "spend", amount_spent: "spend", amount_spent_usd: "spend",
  impressions: "impressions", clicks: "clicks", link_clicks: "clicks",
  conversions: "conversions", results: "conversions",
};

/**
 * Ad spend by CSV: one row per day, platform and campaign. Columns are matched by name
 * (date, platform, campaign, spend, impressions, clicks, conversions); a platform for the whole
 * file can be picked in the form when the export has no platform column.
 */
export async function importSpend(_: MarketingState, f: FormData): Promise<MarketingState> {
  try {
    const file = f.get("file");
    const text = file instanceof File ? await file.text() : String(f.get("csv") ?? "");
    const fallbackPlatform = String(f.get("platform") ?? "").trim().toLowerCase();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) throw new Error("The file needs a header row and at least one row of data.");
    if (lines.length > 5001) throw new Error("Import up to 5,000 rows at a time.");
    const head = cells(lines[0]).map((h) => HEAD[h.toLowerCase().replace(/[^a-z_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")] ?? null);
    if (!head.includes("date") || !head.includes("spend")) throw new Error("Couldn’t find a date and a spend column.");
    const rows: Record<string, string>[] = [];
    for (const line of lines.slice(1)) {
      const c = cells(line);
      const r: Record<string, string> = {};
      head.forEach((h, i) => {
        if (h && c[i] !== undefined) r[h] = c[i];
      });
      r.platform = (r.platform || fallbackPlatform).toLowerCase();
      if (!r.platform) throw new Error("Some rows have no platform. Pick one for the whole file.");
      const d = new Date(r.date);
      if (!r.date || Number.isNaN(d.getTime())) throw new Error(`“${r.date ?? ""}” isn’t a date.`);
      r.date = d.toISOString().slice(0, 10);
      r.spend = String(Number(String(r.spend ?? "0").replace(/[$,\s]/g, "")) || 0);
      for (const k of ["impressions", "clicks", "conversions"]) r[k] = String(Math.round(Number(String(r[k] ?? "0").replace(/[,\s]/g, "")) || 0));
      rows.push(r);
    }
    const n = await rpc<number>("admin_import_spend", { p_rows: rows });
    const total = rows.reduce((s, r) => s + Number(r.spend), 0);
    revalidatePath("/app/admin/marketing");
    return { ok: `Imported ${n} rows, $${total.toFixed(2)} of spend.` };
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function saveCampaign(_: MarketingState, f: FormData): Promise<MarketingState> {
  try {
    const name = String(f.get("name") ?? "").trim();
    if (!name) throw new Error("Give the campaign a name.");
    const dollars = (k: string) => {
      const v = String(f.get(k) ?? "").replace(/[$,\s]/g, "");
      return v ? Math.round(Number(v) * 100) : null;
    };
    const p = {
      name,
      channel: String(f.get("channel") ?? "paid"),
      platform: String(f.get("platform") ?? ""),
      objective: String(f.get("objective") ?? ""),
      utm_campaign: String(f.get("utm_campaign") ?? "").trim() || null,
      budget_cents: dollars("budget"),
      target_cac_cents: dollars("target_cac"),
      start_date: String(f.get("start_date") ?? "") || null,
      end_date: String(f.get("end_date") ?? "") || null,
      owner: String(f.get("owner") ?? ""),
      status: "active",
    };
    await rpc<string>("admin_campaign_save", { p });
    revalidatePath("/app/admin/marketing");
    return { ok: `Saved “${name}”. Tag its links with utm_campaign=${p.utm_campaign ?? "…"} so signups count toward it.` };
  } catch (e) {
    return { error: msg(e) };
  }
}
