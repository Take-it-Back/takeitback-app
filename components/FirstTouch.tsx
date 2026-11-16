"use client";

import { useEffect } from "react";

// Saves where a visitor first came from (UTM tags, ad click IDs, the referring site, the first page)
// in one first-party cookie for takeitback.app and its subdomains, so a signup can be credited to the
// ad or post that brought the person. Set once; later visits never overwrite it.
export const FIRST_TOUCH_COOKIE = "tib_ft";
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_IDS = ["gclid", "fbclid", "ttclid", "msclkid", "gbraid", "wbraid"] as const;
const DAYS = 90;
const OWN = /(^|\.)takeitback\.app$/i;

export function readFirstTouch(): Record<string, unknown> | null {
  try {
    const raw = document.cookie.split("; ").find((c) => c.startsWith(`${FIRST_TOUCH_COOKIE}=`));
    return raw ? JSON.parse(decodeURIComponent(raw.slice(FIRST_TOUCH_COOKIE.length + 1))) : null;
  } catch {
    return null;
  }
}

export default function FirstTouch() {
  useEffect(() => {
    try {
      if (readFirstTouch()) return;
      const url = new URL(window.location.href);
      if (url.hostname.startsWith("admin.")) return;
      const touch: Record<string, unknown> = {};
      for (const k of KEYS) {
        const v = url.searchParams.get(k);
        if (v) touch[k] = v.slice(0, 200);
      }
      const ids: Record<string, string> = {};
      for (const k of CLICK_IDS) {
        const v = url.searchParams.get(k);
        if (v) ids[k] = v.slice(0, 200);
      }
      if (Object.keys(ids).length) touch.click_ids = ids;
      const ref = document.referrer;
      if (ref && !OWN.test(new URL(ref).hostname)) touch.referrer = ref.slice(0, 500);
      touch.landing_page = (url.pathname + url.search).slice(0, 500);
      touch.at = new Date().toISOString();
      const domain = OWN.test(url.hostname) ? "; domain=.takeitback.app" : "";
      document.cookie = `${FIRST_TOUCH_COOKIE}=${encodeURIComponent(JSON.stringify(touch))}; max-age=${DAYS * 86400}; path=/; samesite=lax${domain}${url.protocol === "https:" ? "; secure" : ""}`;
    } catch {
      // never block the page over attribution
    }
  }, []);
  return null;
}
