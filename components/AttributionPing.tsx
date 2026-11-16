"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { readFirstTouch } from "@/components/FirstTouch";

const SENT = "tib.attributed";
const SEEN = "tib.seen";

/** Signed-in only: hands the saved first touch to the database once (it keeps the first it gets),
 *  and marks the person as seen at most once a day. Renders nothing. */
export default function AttributionPing() {
  useEffect(() => {
    const sb = createClient();
    const today = new Date().toISOString().slice(0, 10);
    let sent = false, seen = false;
    try {
      sent = !!localStorage.getItem(SENT);
      seen = localStorage.getItem(SEEN) === today;
    } catch {}
    if (sent && seen) return;
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      if (!sent) {
        sb.rpc("record_attribution", { p: readFirstTouch() ?? { landing_page: null } }).then(({ error }) => {
          if (!error) try { localStorage.setItem(SENT, "1"); } catch {}
        });
      }
      if (!seen) {
        sb.rpc("touch_last_seen").then(({ error }) => {
          if (!error) try { localStorage.setItem(SEEN, today); } catch {}
        });
      }
    });
  }, []);
  return null;
}
