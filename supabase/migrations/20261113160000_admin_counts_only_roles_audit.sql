-- Admin build (Sections 2 and 8). The overview stops returning case titles, amounts and emails
-- next to cases: counts, categories and dates only. Adds admin roles (seeded from is_admin) and an
-- append-only audit log.

-- 1. Roles. Everyone who is an admin today becomes Owner; profiles.is_admin keeps working alongside.
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'support', 'marketing', 'readonly')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
alter table public.admin_roles enable row level security;
revoke all on public.admin_roles from anon, authenticated;
insert into public.admin_roles (user_id, role) select id, 'owner' from public.profiles where is_admin
on conflict (user_id) do nothing;

create or replace function private.admin_role()
returns text language sql stable security definer set search_path to '' as $$
  select coalesce(
    (select r.role from public.admin_roles r where r.user_id = auth.uid()),
    (select 'owner' from public.profiles p where p.id = auth.uid() and p.is_admin))
  where coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

-- 2. Audit log: who, before, after, why, from where. Never changed or removed.
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid,
  admin_email text,
  action text not null,
  target_type text,
  target_id text,
  before jsonb,
  after jsonb,
  reason text,
  ip text
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;
revoke update, delete, truncate on public.admin_audit_log from service_role;

create or replace function private.audit_log_is_append_only()
returns trigger language plpgsql as $$
begin
  raise exception 'admin_audit_log is append-only' using errcode = '42501';
end;
$$;
drop trigger if exists admin_audit_log_append_only on public.admin_audit_log;
create trigger admin_audit_log_append_only before update or delete on public.admin_audit_log
  for each row execute function private.audit_log_is_append_only();
drop trigger if exists admin_audit_log_no_truncate on public.admin_audit_log;
create trigger admin_audit_log_no_truncate before truncate on public.admin_audit_log
  for each statement execute function private.audit_log_is_append_only();

create or replace function public.admin_log(p_action text, p_target_type text default null, p_target_id text default null,
  p_before jsonb default null, p_after jsonb default null, p_reason text default null, p_ip text default null)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if private.admin_role() is null then raise exception 'not allowed' using errcode = '42501'; end if;
  insert into public.admin_audit_log (admin_id, admin_email, action, target_type, target_id, before, after, reason, ip)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), left(p_action, 80), left(p_target_type, 40),
          left(p_target_id, 120), p_before, p_after, left(p_reason, 500), left(p_ip, 64));
end;
$$;
revoke all on function public.admin_log(text, text, text, jsonb, jsonb, text, text) from public, anon;
grant execute on function public.admin_log(text, text, text, jsonb, jsonb, text, text) to authenticated;

-- 3. The overview, counts only next to cases.
create or replace function public.admin_overview()
returns jsonb language plpgsql security definer set search_path to '' as $$
declare result jsonb;
begin
  if private.admin_role() is null then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'users', (select count(*) from public.profiles),
      'premium', (select count(*) from public.profiles where plan = 'premium' and plan_status in ('active','trialing','past_due')),
      'trialing', (select count(*) from public.profiles where plan_status = 'trialing'),
      'cases', (select count(*) from public.cases where not is_demo),
      'cases_30d', (select count(*) from public.cases where not is_demo and created_at > now() - interval '30 days'),
      'open_cases', (select count(*) from public.cases where not is_demo and status not in ('won','settled','closed')),
      'needs_help', (select count(*) from public.cases where status = 'needs_help'),
      'letters', (select count(*) from public.letters),
      'letters_sent', (select count(*) from public.letters where status = 'sent'),
      'taken_back', (select coalesce(sum(outcome_amount), 0) from public.cases where status in ('won','settled')),
      'in_play', (select coalesce(sum(amount_at_stake), 0) from public.cases where not is_demo and status not in ('won','settled','closed')),
      'ai_24h', (select count(*) from public.ai_usage where created_at > now() - interval '24 hours'),
      'ai_7d', (select count(*) from public.ai_usage where created_at > now() - interval '7 days'),
      'ai_failed_7d', (select count(*) from public.app_errors where area in ('analyze','reply','letter') and created_at > now() - interval '7 days'),
      'stuck', (select count(*) from public.cases where status = 'analyzing' and updated_at < now() - interval '10 minutes'),
      'errors_7d', (select count(*) from public.app_errors where created_at > now() - interval '7 days')
    ),
    'funnel', jsonb_build_object(
      'signed_up', (select count(*) from public.profiles),
      'scanned', (select count(distinct user_id) from public.cases where not is_demo),
      'wrote_letter', (select count(distinct user_id) from public.letters),
      'sent_letter', (select count(distinct user_id) from public.letters where status = 'sent'),
      'premium', (select count(*) from public.profiles where plan = 'premium' and plan_status in ('active','trialing','past_due'))
    ),
    'by_category', (select coalesce(jsonb_object_agg(category, n), '{}'::jsonb) from (select category, count(*) n from public.cases where not is_demo group by category) c),
    'users', (select coalesce(jsonb_agg(u order by u.created_at desc), '[]'::jsonb) from (
      select p.id, au.email, p.full_name, p.state, p.plan, p.plan_status, p.is_admin, p.created_at, au.last_sign_in_at,
        (select count(*) from public.cases c where c.user_id = p.id and not c.is_demo) as cases,
        (select count(*) from public.letters l where l.user_id = p.id) as letters
      from public.profiles p join auth.users au on au.id = p.id
      order by p.created_at desc limit 200) u),
    'recent_cases', (select coalesce(jsonb_agg(c order by c.created_at desc), '[]'::jsonb) from (
      select c.id, c.category, c.status, c.created_at
      from public.cases c where not c.is_demo
      order by c.created_at desc limit 25) c),
    'ai_failures', (select coalesce(jsonb_agg(f order by f.created_at desc), '[]'::jsonb) from (
      select e.area, e.message, e.created_at, c.category
      from public.app_errors e
      left join public.cases c on e.path ~ '^/app/cases/[0-9a-f-]{36}' and c.id = substring(e.path from '^/app/cases/([0-9a-f-]{36})')::uuid
      where e.area in ('analyze','reply','letter')
      order by e.created_at desc limit 30) f),
    'stuck_cases', (select coalesce(jsonb_agg(s order by s.updated_at), '[]'::jsonb) from (
      select c.id, c.category, c.updated_at
      from public.cases c
      where c.status = 'analyzing' and c.updated_at < now() - interval '10 minutes'
      order by c.updated_at limit 20) s),
    'errors', (select coalesce(jsonb_agg(e order by e.created_at desc), '[]'::jsonb) from (
      select e.area, e.message, e.path, e.created_at, au.email from public.app_errors e left join auth.users au on au.id = e.user_id
      where e.area not in ('analyze','reply','letter')
      order by e.created_at desc limit 20) e)
  ) into result;
  return result;
end;
$$;
