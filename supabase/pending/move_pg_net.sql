-- NOT APPLIED (needs approval). Moves pg_net out of the public schema. Uptime checks in flight are lost (about a minute).
drop extension if exists pg_net;
create extension pg_net with schema extensions;
