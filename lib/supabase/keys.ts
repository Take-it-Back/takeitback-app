// One place that decides which Supabase key is used.
// New key names come first (publishable / secret); the old names are read only as a fallback
// so nothing breaks while the Vercel settings are switched over. See docs/supabase-keys.md.

export const supabaseUrl = (): string => process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Safe in the browser. Row-level security decides what it can see. */
export const publishableKey = (): string =>
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

/** Server only. Skips row-level security. Null when not set. */
export const secretKey = (): string | null =>
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
