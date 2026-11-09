-- Applied 2026-11-09. New functions in public are not runnable by signed-out callers unless granted on purpose:
--   grant execute on function public.x(...) to anon;
alter default privileges for role postgres in schema public revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon;
