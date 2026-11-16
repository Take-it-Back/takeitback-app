"use client";

import { useActionState } from "react";
import { setRole, type TeamState } from "./actions";

export default function TeamForm() {
  const [state, act, busy] = useActionState<TeamState, FormData>(setRole, {});
  return (
    <form action={act} className="stack g12">
      <div className="row wrap g12" style={{ alignItems: "flex-end" }}>
        <label className="stack" style={{ gap: 6, flex: "1 1 240px" }}>
          <span className="small muted">Email of their Take it Back account</span>
          <input name="email" type="email" required className="input" placeholder="name@example.com" />
        </label>
        <label className="stack" style={{ gap: 6 }}>
          <span className="small muted">Role</span>
          <select name="role" className="input" defaultValue="support">
            <option value="owner">Owner: everything, including the team</option>
            <option value="admin">Admin: everything except the team</option>
            <option value="support">Support: support inbox and users</option>
            <option value="marketing">Marketing: marketing and counts</option>
            <option value="readonly">Read only: looks, changes nothing</option>
          </select>
        </label>
        <button type="submit" className="btn-plain" disabled={busy}>{busy ? "Saving…" : "Add or change"}</button>
      </div>
      {state.error && <p className="error" role="alert" style={{ margin: 0 }}>{state.error}</p>}
      {state.ok && <p className="small" role="status" style={{ margin: 0 }}>{state.ok}</p>}
    </form>
  );
}
