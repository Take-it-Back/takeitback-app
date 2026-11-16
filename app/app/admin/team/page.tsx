import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/server";
import { requireAdminRole, ROLE_LABEL, type AdminRole } from "@/lib/adminRole";
import AdminMfa from "@/components/AdminMfa";
import TeamForm from "./TeamForm";
import { removeMember } from "./actions";

export const metadata: Metadata = { title: "Team", robots: { index: false } };

type Member = { user_id: string; email: string; role: AdminRole; added: string; last_sign_in: string | null; mfa: boolean };
type Entry = { at: string; admin_email: string | null; action: string; target_type: string | null; target_id: string | null; reason: string | null; after: Record<string, unknown> | null };
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never");
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default async function TeamPage() {
  const { supabase, user } = await requireUser();
  const { role } = await requireAdminRole(supabase);
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    return <main id="main" className="app-main wide"><h1 className="page-title" style={{ marginBottom: 16 }}>Team</h1><AdminMfa /></main>;
  }
  const [{ data: team }, { data: log }] = await Promise.all([
    supabase.rpc("admin_team"),
    role === "owner" || role === "admin" ? supabase.rpc("admin_audit_recent", { p_limit: 100 }) : Promise.resolve({ data: [] }),
  ]);
  const members = (team as Member[] | null) ?? [];
  const entries = (log as Entry[] | null) ?? [];
  const owner = role === "owner";
  return (
    <main id="main" className="app-main wide">
      <div className="stack g20">
        <Link href="/app/admin" className="muted small">← Admin</Link>
        <h1 className="page-title" style={{ margin: 0 }}>Team</h1>
        <p className="muted" style={{ margin: 0, maxWidth: "62ch" }}>Everyone who can open this admin, and what they can do. Each person signs in with their own account and a code from an authenticator app.</p>

        <section className="card" style={{ padding: "16px 12px" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="pt" style={{ fontSize: 14 }}>
              <thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Authenticator</th><th scope="col">Last sign-in</th><th scope="col">Added</th>{owner && <th scope="col"><span className="sr-only">Remove</span></th>}</tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id}>
                    <td>{m.email}{m.user_id === user.id ? <span className="muted small"> (you)</span> : null}</td>
                    <td data-label="Role">{ROLE_LABEL[m.role]}</td>
                    <td data-label="Authenticator">{m.mfa ? "Set up" : <span className="tag tag-orange">Not yet</span>}</td>
                    <td data-label="Last sign-in">{day(m.last_sign_in)}</td>
                    <td data-label="Added">{day(m.added)}</td>
                    {owner && <td>{m.user_id !== user.id && <form action={removeMember}><input type="hidden" name="user" value={m.user_id} /><button type="submit" className="btn-plain" style={{ fontSize: 13 }}>Remove</button></form>}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {owner ? (
          <section className="card stack g12">
            <span className="eyebrow">Add someone or change a role</span>
            <p className="muted small" style={{ margin: 0 }}>They need a Take it Back account first. Roles take effect on their next page load.</p>
            <TeamForm />
          </section>
        ) : <p className="muted small" style={{ margin: 0 }}>Only an owner can add people or change roles.</p>}

        {(role === "owner" || role === "admin") && (
          <section className="card" style={{ padding: "16px 12px" }}>
            <span className="eyebrow" style={{ paddingLeft: 10 }}>Audit log · newest first</span>
            <p className="muted small" style={{ margin: "6px 10px 0" }}>Every change made from the admin. Entries can&apos;t be edited or deleted.</p>
            {entries.length ? (
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table className="pt" style={{ fontSize: 14 }}>
                  <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">On</th><th scope="col">Why</th></tr></thead>
                  <tbody>{entries.map((e, i) => <tr key={i}><td>{when(e.at)}</td><td data-label="Who">{e.admin_email ?? "System"}</td><td data-label="What">{e.action}</td><td data-label="On">{[e.target_type, e.target_id?.slice(0, 8)].filter(Boolean).join(" ")}</td><td data-label="Why">{e.reason ?? ""}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="muted" style={{ margin: "8px 10px 0" }}>Nothing yet.</p>}
          </section>
        )}
      </div>
    </main>
  );
}
