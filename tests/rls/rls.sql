-- Row-level security tests for Take it Back.
-- Runs as one block and always ends in an exception, so every row it creates is rolled back:
--   'RLS_OK'            every check passed
--   'RLS_FAIL: ...'     one line per failed check
-- Run by scripts/db-checks.mjs (CI) or pasted into the Supabase SQL editor.
do $rls$
declare
  a uuid := gen_random_uuid();   -- test user A
  b uuid := gen_random_uuid();   -- test user B
  a_case uuid;
  n bigint;
  fails text[] := '{}';
  t text;
  -- Tables a signed-out visitor must never read a row from.
  private_tables text[] := array['cases','profiles','letters','documents','deadlines','events','sends','case_passes',
    'case_shares','support_tickets','support_messages','device_tokens','push_subscriptions','ai_usage','ai_calls',
    'app_errors','app_waitlist','agency_leads','roadmap_items','portfolio_goals','portfolio_issues','portfolio_messages','portfolio_plan'];
  -- Server-only tables: RLS on with no policy (deny-all to the API). Read only with the secret key.
  server_only text[] := array['agency_leads','roadmap_items','portfolio_goals','portfolio_issues','portfolio_messages','portfolio_plan'];
  -- Tables where more than one SELECT policy is intended (owner plus helpers or case owner).
  multi_select_ok text[] := array['cases','deadlines','documents','events','letters','case_shares'];
  -- SECURITY DEFINER functions a signed-out caller may run. Each one checks BILLING_SECRET, a guest token, or is public on purpose.
  anon_ok text[] := array['billing_apply','billing_apply_apple','billing_apply_google','grant_case_pass','referral_bank_month',
    'referral_reward','revoke_case_pass','send_set_status','stripe_event_done','stripe_event_seen','support_create',
    'support_guest_thread','support_inbound','support_reply','support_set_status','uptime_status'];
begin
  -- 1. Structure ------------------------------------------------------------
  for t in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and not c.relrowsecurity loop
    fails := fails || format('RLS is off on public.%s', t);
  end loop;

  for t in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
      and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname)
      and c.relname <> all(server_only) loop
    fails := fails || format('public.%s has no policy and is not on the server-only list', t);
  end loop;

  for t in select tablename from pg_policies where schemaname = 'public' and permissive = 'PERMISSIVE' and cmd in ('SELECT','ALL')
      group by tablename having count(*) > 1 and tablename <> all(multi_select_ok) loop
    fails := fails || format('public.%s has more than one SELECT policy (they widen each other)', t);
  end loop;

  for t in select p.proname from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prosecdef
      and has_function_privilege('anon', p.oid, 'execute') and p.proname <> all(anon_ok) loop
    fails := fails || format('anon can run SECURITY DEFINER function public.%s', t);
  end loop;

  for t in select p.proname from pg_proc p where p.pronamespace = 'public'::regnamespace
      and pg_get_function_result(p.oid) = 'trigger'
      and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute')) loop
    fails := fails || format('trigger function public.%s is callable through the API', t);
  end loop;

  if exists (select 1 from pg_extension e where e.extname = 'pg_net' and e.extnamespace = 'public'::regnamespace) then
    fails := fails || 'pg_net is installed in the public schema';
  end if;

  -- 2. Two test users (rolled back at the end) ---------------------------------
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a-' || a || '@test.invalid', '{}', now(), now()),
         (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b-' || b || '@test.invalid', '{}', now(), now());

  -- User A creates a case and a deadline.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  insert into public.cases (user_id, title) values (a, 'RLS test') returning id into a_case;
  insert into public.deadlines (case_id, user_id, title, due_date) values (a_case, a, 'RLS test', current_date + 7);
  select count(*) into n from public.cases where id = a_case;
  if n <> 1 then fails := fails || 'user A cannot see their own case'; end if;

  -- A cannot give themselves Premium.
  begin
    update public.profiles set plan = 'premium', plan_status = 'active' where id = a;
    fails := fails || 'user A could change their own plan';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set is_admin = true where id = a;
    fails := fails || 'user A could make themselves an admin';
  exception when insufficient_privilege then null;
  end;

  -- A cannot create a case for B.
  begin
    insert into public.cases (user_id, title) values (b, 'RLS test');
    fails := fails || 'user A created a case owned by user B';
  exception when others then null;
  end;

  -- User B sees nothing of A's.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.cases where id = a_case;
  if n <> 0 then fails := fails || 'user B can read user A''s case'; end if;
  select count(*) into n from public.deadlines where case_id = a_case;
  if n <> 0 then fails := fails || 'user B can read user A''s deadlines'; end if;
  select count(*) into n from public.profiles where id = a;
  if n <> 0 then fails := fails || 'user B can read user A''s profile'; end if;
  update public.cases set title = 'changed by B' where id = a_case;
  get diagnostics n = row_count;
  if n <> 0 then fails := fails || 'user B changed user A''s case'; end if;
  delete from public.cases where id = a_case;
  get diagnostics n = row_count;
  if n <> 0 then fails := fails || 'user B deleted user A''s case'; end if;
  begin
    insert into public.letters (case_id, user_id, body) values (a_case, b, 'x');
    fails := fails || 'user B added a letter to user A''s case';
  exception when others then null;
  end;
  begin
    perform public.admin_overview();
    fails := fails || 'a normal user ran admin_overview';
  exception when others then null;
  end;

  -- 3. Signed-out visitor -----------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  foreach t in array private_tables loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      if n <> 0 then fails := fails || format('a signed-out visitor can read %s rows of public.%s', n, t); end if;
    exception when insufficient_privilege then null;
    end;
  end loop;

  execute 'reset role';
  if array_length(fails, 1) is null then
    raise exception 'RLS_OK';
  else
    raise exception 'RLS_FAIL: %', array_to_string(fails, ' | ');
  end if;
end
$rls$;
