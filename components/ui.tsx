import Link from "next/link";
import type { Category } from "@/lib/types";
import { STATUS_INFO } from "@/lib/rules";
import type { CaseStatus } from "@/lib/types";

/** The mark: a freestanding "take it back" U-turn arrow. */
// Final logo (17 Nov 2026): the crossed-out bill. Files live in public/brand.
export function Mark({ size = 32, inverse = false }: { size?: number; inverse?: boolean }) {
  const bill = inverse ? "#fff" : "#BF4F28";
  const slash = inverse ? "#fff" : "#2A1209";
  return (
    <svg width={size} height={size} viewBox="12 8 76 84" aria-hidden="true">
      <path d="M26 12 H74 V88 L66 82 L58 88 L50 82 L42 88 L34 82 L26 88 Z" fill="none" stroke={bill} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 34 H62 M38 48 H62 M38 62 H54" fill="none" stroke={bill} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 76 L84 22" fill="none" stroke={slash} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", size = 22, inverse = false }: { href?: string; size?: number; inverse?: boolean }) {
  const ink = inverse ? "#fff" : "#2A1209";
  return (
    <Link href={href} className="logo" aria-label="Take it back home" style={{ color: ink }}>
      <Mark size={Math.round(size * 1.5)} inverse={inverse} />
      <span aria-hidden="true" style={{ width: 1.5, alignSelf: "stretch", margin: `${Math.round(size * 0.15)}px 0`, background: ink, opacity: 0.2 }} />
      <span style={{ fontFamily: "'TIB Logo', var(--sans)", fontWeight: 700, fontSize: size, letterSpacing: "-0.01em" }}>take it back</span>
    </Link>
  );
}

export function Arrow({ color = "#fff", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function CtaLink({ href, children, variant = "ink", block }: { href: string; children: React.ReactNode; variant?: "ink" | "orange" | "light"; block?: boolean }) {
  return (
    <Link href={href} prefetch={href.startsWith("/login") ? false : undefined} className={`btn btn-${variant}${block ? " btn-block" : ""}`}>
      {children}
      <span className="dot">
        <Arrow color={variant === "orange" ? "#BF4F28" : "#fff"} />
      </span>
    </Link>
  );
}

export function CtaButton({ children, variant = "orange", block, disabled, type = "submit", onClick }: { children: React.ReactNode; variant?: "ink" | "orange" | "light"; block?: boolean; disabled?: boolean; type?: "submit" | "button"; onClick?: () => void }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant}${block ? " btn-block" : ""}`}>
      {children}
      <span className="dot">
        <Arrow color={variant === "orange" ? "#BF4F28" : "#fff"} />
      </span>
    </button>
  );
}

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="Back" className="back-btn">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
    </Link>
  );
}

export function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
  );
}

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (category) {
    case "insurance":
      return <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></svg>;
    case "landlord":
      return <svg {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>;
    case "debt":
      return <svg {...p}><path d="M4 6h16v12H4z" /><path d="M4 7l8 6 8-6" /></svg>;
    case "medical":
      return <svg {...p}><path d="M6 3h9l3 3v15H6z" /><path d="M12 9v6" /><path d="M9 12h6" /></svg>;
    default:
      return <svg {...p}><path d="M6 3h9l3 3v15H6z" /><path d="M9 12h6" /></svg>;
  }
}

export function StatusTag({ status }: { status: CaseStatus }) {
  const s = STATUS_INFO[status];
  return <span className={`tag tag-${s.tone}`}>{s.label}</span>;
}

export function Avatar({ tone = "orange", size = 44 }: { tone?: "orange" | "ink"; size?: number }) {
  const c = tone === "orange" ? "#BF4F28" : "#1A1A1A";
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill={tone === "orange" ? "#FDEEE7" : "#F3F3F3"} />
      <path d="M8 20c2-10 26-12 28 0-4-4-10-5-14-4-5 1-10 2-14 4z" fill={c} />
      <circle cx="17" cy="24" r="1.8" fill="#1A1A1A" />
      <circle cx="27" cy="24" r="1.8" fill="#1A1A1A" />
      <path d="M17 30c3 3 7 3 10 0" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
