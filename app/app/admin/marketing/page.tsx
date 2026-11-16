import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/server";
import { requireAdminRole } from "@/lib/adminRole";
import { ImportSpend, NewCampaign } from "./Forms";

export const metadata: Metadata = { title: "Marketing", robots: { index: false } };
export const dynamic = "force-dynamic";

type Channel = { channel: string; signups: number; activated: number; trials: number; paid: number };
type Campaign = { utm_campaign: string; source: string | null; medium: string | null; signups: number; paid: number; spend_cents: number };
type Marketing = {
  from: string;
  channels: Channel[];
  daily: { date: string; signups: number; trials: number; spend_cents: number; active: number }[];
  campaigns: Campaign[];
  spend: { platform: string; spend_cents: number; impressions: number; clicks: number; conversions: number }[];
  attributed_share: number | null;
  new_paying: number;
  campaign_list: { id: string; name: string; utm_campaign: string | null; platform: string | null; status: string; budget_cents: number | null; target_cac_cents: number | null }[];
};

const RANGES = [7, 30, 90, 365] as const;
const CHANNEL: Record<string, string> = {
  paid: "Paid ads", organic: "Organic search", social: "Social", referral: "Referral", email: "Email", partner: "Partner", direct: "Direct", unknown: "Before tracking",
};
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 100 ? 2 : 0 });
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

export default async function MarketingPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { supabase } = await requireUser();
  const { role } = await requireAdminRole(supabase, ["owner", "admin", "marketing", "readonly"]);
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days) as (typeof RANGES)[number]) ? Number(sp.days) : 30;
  const { data, error } = await supabase.rpc("admin_marketing", { p_days: days });
  const m = data as Marketing | null;
  const edit = role !== "readonly";

  if (!m) {
    return (
      <main id="main" className="app-main wide">
        <Link href="/app/admin" className="muted small">← Admin</Link>
        <h1 className="page-title">Marketing</h1>
        <p className="error" role="alert">Couldn&apos;t load marketing: {error?.message || "no data"}</p>
      </main>
    );
  }
  const spend = m.spend.reduce((s, r) => s + r.spend_cents, 0) / 100;
  const signups = m.channels.reduce((s, r) => s + r.signups, 0);
  const paid = m.channels.find((c) => c.channel === "paid");
  const cac = m.new_paying > 0 && spend > 0 ? spend / m.new_paying : null;
  const tiles: [string, string, string][] = [
    ["Signups", String(signups), `${m.attributed_share ?? 0}% have a known source`],
    ["From paid ads", String(paid?.signups ?? 0), `${pct(paid?.paid ?? 0, paid?.signups ?? 0)} became paying`],
    ["Ad spend", usd(spend), `${m.spend.length} platform${m.spend.length === 1 ? "" : "s"}`],
    ["Cost per paying customer", cac ? usd(cac) : "–", `${m.new_paying} new paying`],
  ];
  const maxDay = Math.max(1, ...m.daily.map((d) => d.signups));

  return (
    <main id="main" className="app-main wide">
      <div className="stack g20">
        <Link href="/app/admin" className="muted small">← Admin</Link>
        <div className="page-head" style={{ flexWrap: "wrap" }}>
          <h1 className="page-title" style={{ margin: 0 }}>Marketing</h1>
          <nav aria-label="Range" className="row wrap g8">
            {RANGES.map((r) => (
              <Link key={r} href={`/app/admin/marketing?days=${r}`} className={`tag ${r === days ? "tag-ink" : "tag-gray"}`} style={{ textDecoration: "none", padding: "8px 14px", fontSize: 14 }} aria-current={r === days ? "page" : undefined}>
                {r === 365 ? "1 year" : `${r} days`}
              </Link>
            ))}
          </nav>
        </div>
        <p className="muted" style={{ margin: 0, maxWidth: "66ch" }}>Where signups come from, what ads cost, and what each campaign brings back. A signup is credited to the first ad, post or site that brought the person.</p>

        <div className="grid-tiles">
          {tiles.map(([label, value, sub]) => (
            <div key={label} className="card stack" style={{ borderRadius: 22 }}>
              <span className="small muted">{label}</span>
              <span className="big-num" style={{ fontSize: 34 }}>{value}</span>
              <span className="small muted">{sub}</span>
            </div>
          ))}
        </div>

        <section className="card">
          <span className="eyebrow">Signups by day</span>
          <div role="img" aria-label={`Signups per day over the last ${days} days`} style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 110, marginTop: 14 }}>
            {m.daily.map((d) => (
              <span key={d.date} title={`${d.date}: ${d.signups} signups${d.spend_cents ? `, ${usd(d.spend_cents / 100)} spend` : ""}`} style={{ flex: 1, minWidth: 2, height: `${Math.max(2, (d.signups / maxDay) * 100)}%`, background: d.signups ? "#1A1A1A" : "#EDEDED", borderRadius: 2 }} />
            ))}
          </div>
          <p className="muted small" style={{ margin: "8px 0 0" }}>{m.daily[0]?.date} to {m.daily[m.daily.length - 1]?.date}. Busiest day: {maxDay} signup{maxDay === 1 ? "" : "s"}.</p>
        </section>

        <section className="card" style={{ padding: "16px 12px" }}>
          <span className="eyebrow" style={{ paddingLeft: 10 }}>Channels</span>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className="pt" style={{ fontSize: 14 }}>
              <thead><tr><th scope="col">Channel</th><th scope="col">Signups</th><th scope="col">Sent a letter</th><th scope="col">Trials</th><th scope="col">Paying</th><th scope="col">Signup to paying</th></tr></thead>
              <tbody>
                {m.channels.length ? m.channels.map((c) => (
                  <tr key={c.channel}><td>{CHANNEL[c.channel] ?? c.channel}</td><td data-label="Signups">{c.signups}</td><td data-label="Sent a letter">{c.activated}</td><td data-label="Trials">{c.trials}</td><td data-label="Paying">{c.paid}</td><td data-label="Signup to paying">{pct(c.paid, c.signups)}</td></tr>
                )) : <tr><td colSpan={6} className="muted">No signups in this range.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" style={{ padding: "16px 12px" }}>
          <span className="eyebrow" style={{ paddingLeft: 10 }}>Campaigns</span>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className="pt" style={{ fontSize: 14 }}>
              <thead><tr><th scope="col">utm_campaign</th><th scope="col">Source / medium</th><th scope="col">Signups</th><th scope="col">Paying</th><th scope="col">Spend</th><th scope="col">Cost per paying</th></tr></thead>
              <tbody>
                {m.campaigns.length ? m.campaigns.map((c) => (
                  <tr key={`${c.utm_campaign}-${c.source}-${c.medium}`}><td>{c.utm_campaign}</td><td data-label="Source">{[c.source, c.medium].filter(Boolean).join(" / ") || "–"}</td><td data-label="Signups">{c.signups}</td><td data-label="Paying">{c.paid}</td><td data-label="Spend">{c.spend_cents ? usd(c.spend_cents / 100) : "–"}</td><td data-label="Cost per paying">{c.paid && c.spend_cents ? usd(c.spend_cents / 100 / c.paid) : "–"}</td></tr>
                )) : <tr><td colSpan={6} className="muted">No tagged signups yet. Add utm_campaign to ad and post links and they show up here.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" style={{ padding: "16px 12px" }}>
          <span className="eyebrow" style={{ paddingLeft: 10 }}>Spend by platform</span>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className="pt" style={{ fontSize: 14 }}>
              <thead><tr><th scope="col">Platform</th><th scope="col">Spend</th><th scope="col">Impressions</th><th scope="col">Clicks</th><th scope="col">Conversions</th></tr></thead>
              <tbody>
                {m.spend.length ? m.spend.map((s) => (
                  <tr key={s.platform}><td>{s.platform.replace(/_/g, " ")}</td><td data-label="Spend">{usd(s.spend_cents / 100)}</td><td data-label="Impressions">{s.impressions.toLocaleString()}</td><td data-label="Clicks">{s.clicks.toLocaleString()}</td><td data-label="Conversions">{s.conversions.toLocaleString()}</td></tr>
                )) : <tr><td colSpan={5} className="muted">No spend imported for this range.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {m.campaign_list.length > 0 && (
          <section className="card" style={{ padding: "16px 12px" }}>
            <span className="eyebrow" style={{ paddingLeft: 10 }}>Planned campaigns</span>
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table className="pt" style={{ fontSize: 14 }}>
                <thead><tr><th scope="col">Name</th><th scope="col">Tag</th><th scope="col">Platform</th><th scope="col">Budget</th><th scope="col">Target cost per paying</th><th scope="col">Status</th></tr></thead>
                <tbody>{m.campaign_list.map((c) => <tr key={c.id}><td>{c.name}</td><td data-label="Tag">{c.utm_campaign ?? "–"}</td><td data-label="Platform">{c.platform ?? "–"}</td><td data-label="Budget">{c.budget_cents ? usd(c.budget_cents / 100) : "–"}</td><td data-label="Target">{c.target_cac_cents ? usd(c.target_cac_cents / 100) : "–"}</td><td data-label="Status">{c.status}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        {edit && (
          <>
            <section className="card stack g12"><span className="eyebrow">Import ad spend</span><ImportSpend /></section>
            <section className="card stack g12"><span className="eyebrow">Plan a campaign</span><NewCampaign /></section>
          </>
        )}
      </div>
    </main>
  );
}
