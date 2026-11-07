"use client";

import { useEffect, useState } from "react";

type CapApp = { getInfo: () => Promise<{ version?: string; build?: string }> };
type Cap = { isNativePlatform?: () => boolean; getPlatform?: () => string; Plugins?: { App?: CapApp } };

function isOlder(have: string, min: string): boolean {
  const a = have.split(".").map((n) => parseInt(n, 10));
  const b = min.split(".").map((n) => parseInt(n, 10));
  if (a.some(Number.isNaN) || b.some(Number.isNaN)) return false;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}

/* Forced-update gate for the phone apps. Inside the app it asks /api/app-version for the oldest
   version still allowed and, if this build is older, covers the screen with an update prompt.
   Fails open: any error lets the app through. Does nothing in a normal browser. */
export default function UpdateGate() {
  const [store, setStore] = useState<string | null>(null);
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: Cap }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    (async () => {
      try {
        const info = await cap.Plugins?.App?.getInfo();
        const have = info?.version;
        if (!have) return;
        const res = await fetch("/api/app-version", { cache: "no-store" });
        const { min } = (await res.json()) as { min?: string };
        if (min && isOlder(have, min)) {
          setStore(cap.getPlatform?.() === "ios" ? "https://apps.apple.com/app/take-it-back" : "https://play.google.com/store/apps/details?id=app.takeitback");
        }
      } catch {
        /* fail open */
      }
    })();
  }, []);
  if (!store) return null;
  return (
    <div role="alertdialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 100000, background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Please update Take it Back</h1>
      <p style={{ opacity: 0.8, maxWidth: 320 }}>This version is no longer supported. Update to keep using the app.</p>
      <a href={store} style={{ marginTop: 16, minHeight: 48, padding: "14px 28px", borderRadius: 999, background: "#fff", color: "#0a0a0a", fontWeight: 700, textDecoration: "none" }}>Open the store</a>
    </div>
  );
}
