# Database

Most of the schema was applied directly to the Supabase project before migrations were kept here.
From 9 Nov 2026 every change is saved in this folder as `<timestamp>_<name>.sql` on the day it is applied.
`supabase/pending/` holds changes that are written but must not be applied yet (each file says when).

Checks: `lib/database.types.ts` is generated from the live database and `tests/rls/rls.sql` tests row-level security.
Both run in CI (`database` job) once the `SUPABASE_ACCESS_TOKEN` repo secret is set. See `scripts/db-checks.mjs`.
