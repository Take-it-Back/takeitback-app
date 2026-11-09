#!/usr/bin/env node
// Database checks for CI. Needs SUPABASE_ACCESS_TOKEN (a Supabase personal access token) and SUPABASE_PROJECT_REF.
//   node scripts/db-checks.mjs types        fail if lib/database.types.ts no longer matches the live database
//   node scripts/db-checks.mjs types --write  regenerate lib/database.types.ts
//   node scripts/db-checks.mjs rls          run tests/rls/rls.sql (always rolled back) and fail on any finding
// Without the token it prints a notice and exits 0, so CI stays green until the secret is added.
import { readFileSync, writeFileSync } from "node:fs";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF || "uzogyqreputvggefnxiy";
const mode = process.argv[2];
const TYPES = "lib/database.types.ts";

if (!token) {
  console.log(`::notice::SUPABASE_ACCESS_TOKEN is not set; skipping the "${mode}" database check.`);
  process.exit(0);
}

const api = (path, init = {}) =>
  fetch(`https://api.supabase.com/v1/projects/${ref}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });

if (mode === "types") {
  const res = await api("/types/typescript?included_schemas=public");
  if (!res.ok) throw new Error(`Type generation failed: ${res.status} ${await res.text()}`);
  const { types } = await res.json();
  if (process.argv.includes("--write")) {
    writeFileSync(TYPES, types);
    console.log(`Wrote ${TYPES}`);
  } else if (readFileSync(TYPES, "utf8") !== types) {
    console.error(`::error::${TYPES} is out of date with the database. Run: node scripts/db-checks.mjs types --write`);
    process.exit(1);
  } else {
    console.log("Database types match.");
  }
} else if (mode === "rls") {
  const query = readFileSync("tests/rls/rls.sql", "utf8");
  const res = await api("/database/query", { method: "POST", body: JSON.stringify({ query }) });
  const text = await res.text();
  // The test always ends with an exception so nothing it writes is kept. RLS_OK means every check passed.
  if (text.includes("RLS_OK")) {
    console.log("Row-level security checks passed.");
  } else {
    const m = text.match(/RLS_FAIL: ([^"]*)/);
    console.error("::error::Row-level security checks failed");
    console.error(m ? m[1].split(" | ").map((l) => " - " + l).join("\n") : text);
    process.exit(1);
  }
} else {
  console.error("Usage: node scripts/db-checks.mjs types|rls [--write]");
  process.exit(2);
}
