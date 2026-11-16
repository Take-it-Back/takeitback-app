"use client";

import { useActionState } from "react";
import { importSpend, saveCampaign, type MarketingState } from "./actions";

function Note({ s }: { s: MarketingState }) {
  if (s.error) return <p role="alert" className="error" style={{ margin: "10px 0 0" }}>{s.error}</p>;
  if (s.ok) return <p role="status" className="small" style={{ margin: "10px 0 0" }}>{s.ok}</p>;
  return null;
}

const PLATFORMS = ["meta", "google", "tiktok", "apple_search_ads", "reddit", "other"];
const Field = ({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) => (
  <label className="stack" style={{ gap: 6, gridColumn: wide ? "1 / -1" : undefined }}><span className="small muted">{label}</span>{children}</label>
);
const grid = { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" } as const;

export function ImportSpend() {
  const [s, action, pending] = useActionState<MarketingState, FormData>(importSpend, {});
  return (
    <form action={action} className="stack g12">
      <p className="muted small" style={{ margin: 0 }}>Export a daily report from the ad platform and upload it. Columns are matched by name: date, campaign, spend, impressions, clicks, conversions. Importing a day again replaces it.</p>
      <div style={grid}>
        <Field label="CSV file"><input name="file" type="file" accept=".csv,text/csv" required className="input" /></Field>
        <Field label="Platform, if the file has no column for it">
          <select name="platform" className="input" defaultValue="">
            <option value="">From the file</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
          </select>
        </Field>
      </div>
      <div><button className="btn-plain" disabled={pending}>{pending ? "Importing…" : "Import spend"}</button><Note s={s} /></div>
    </form>
  );
}

export function NewCampaign() {
  const [s, action, pending] = useActionState<MarketingState, FormData>(saveCampaign, {});
  return (
    <form action={action} style={grid}>
      <Field label="Name"><input name="name" required className="input" /></Field>
      <Field label="utm_campaign tag"><input name="utm_campaign" className="input" placeholder="medical-bills-fall" /></Field>
      <Field label="Channel">
        <select name="channel" className="input" defaultValue="paid">{["paid", "social", "email", "partner", "referral", "organic"].map((c) => <option key={c}>{c}</option>)}</select>
      </Field>
      <Field label="Platform">
        <select name="platform" className="input" defaultValue="meta">{PLATFORMS.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}</select>
      </Field>
      <Field label="Budget ($)"><input name="budget" inputMode="decimal" className="input" /></Field>
      <Field label="Target cost per paying customer ($)"><input name="target_cac" inputMode="decimal" className="input" /></Field>
      <Field label="Start"><input name="start_date" type="date" className="input" /></Field>
      <Field label="End"><input name="end_date" type="date" className="input" /></Field>
      <Field label="Objective" wide><input name="objective" className="input" placeholder="Paid signups from people fighting a medical bill" /></Field>
      <div style={{ gridColumn: "1 / -1" }}><button className="btn-plain" disabled={pending}>{pending ? "Saving…" : "Save campaign"}</button><Note s={s} /></div>
    </form>
  );
}
