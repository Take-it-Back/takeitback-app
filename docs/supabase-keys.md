# Supabase keys

Supabase is retiring the old `anon` and `service_role` keys. The code reads the new names first (lib/supabase/keys.ts)
and the old names only as a fallback, so the switch can happen with no downtime.

## Status (9 Nov 2026)

- Browser key: already the new `sb_publishable_…` key, but stored under the old name `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server secret key: not set anywhere. Nothing in the web app needs it yet.
- The daily-reminders cron job still calls its edge function with the old anon JWT.

## Steps (in this order)

1. **Austin**, Vercel, both projects (`app` and `takeitback-site`), Production + Preview:
   - add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the same `sb_publishable_…` value
   - add `SUPABASE_SECRET_KEY` = a new secret key from Supabase → Project Settings → API Keys (mark it Sensitive)
2. Redeploy both. Check `/api/health`: `new_publishable_key` and `secret_key` should both be `true`.
3. Sign in, open a case, and save a letter on the live site.
4. **Austin**: remove `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_ROLE_KEY` if it exists) from both projects, redeploy, repeat step 3.
5. **Claude**, with approval: redeploy the `daily-reminders` edge function (it now checks `CRON_SECRET` and reads the new
   secret key) and point the cron job at it with `x-cron-secret` instead of the anon JWT.
6. **Austin**: in Supabase → API Keys, disable the legacy JWT keys only after steps 1–5.

Once `SUPABASE_SECRET_KEY` is live, the billing, send and support functions are called with it (lib/supabase/privileged.ts),
and the follow-up migration in `supabase/pending/` closes them to the public API.
