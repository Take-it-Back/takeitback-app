-- Admin build, step 2 for Take it Back (same as the Andamos pilot): team screen, where each person
-- came from, the shared product events, ad spend, and one row of metrics per day for the central
-- dashboard. "events" is already the case timeline here, so product events live in product_events.

-- 1. Team. Roles come from admin_roles (seeded from is_admin); every change is audited.
create or replace function private.admin_require_role(p_roles text[])
returns text language plpgsql stable security definer set search_path to '' as $$
declare r text := private.admin_role();
begin
  if r is null or not (r = any (p_roles)) then raise exception 'not allowed' using errcode = '42501'; end if;
  return r;
end;
$$;

create or replace function public.admin_whoami()
returns jsonb language sql stable security definer set search_path to '' as $$
  select jsonb_build_object(
    'user_id', auth.uid(),
    'email', (select u.email from auth.users u where u.id = auth.uid()),
    'aal', coalesce(auth.jwt() ->> 'aal', 'aal1'),
    'role', coalesce((select r.role from public.admin_roles r where r.user_id = auth.uid()),
                     (select 'owner' from public.profiles p where p.id = auth.uid() and p.is_admin)));
$$;
revoke all on function public.admin_whoami() from public, anon;
grant execute on function public.admin_whoami() to authenticated;

create or replace function public.admin_team()
returns jsonb language plpgsql stable security definer set search_path to '' as $$
begin
  perform private.admin_require_role(array['owner', 'admin', 'support', 'marketing', 'readonly']);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'user_id', r.user_id, 'email', u.email, 'role', r.role, 'added', r.created_at, 'last_sign_in', u.last_sign_in_at,
      'mfa', exists (select 1 from auth.mfa_factors f where f.user_id = r.user_id and f.status = 'verified')) order by r.created_at)
    from public.admin_roles r join auth.users u on u.id = r.user_id), '[]'::jsonb);
end;
$$;

create or replace function public.admin_team_set(p_email text, p_role text, p_reason text default null)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_user uuid; v_before text;
begin
  perform private.admin_require_role(array['owner']);
  if p_role not in ('owner', 'admin', 'support', 'marketing', 'readonly') then raise exception 'unknown role %', p_role; end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then raise exception 'No Take it Back account uses that email. They need to sign up at takeitback.app first.'; end if;
  select role into v_before from public.admin_roles where user_id = v_user;
  if v_before = 'owner' and p_role <> 'owner' and (select count(*) from public.admin_roles where role = 'owner') = 1 then
    raise exception 'There must always be at least one owner.';
  end if;
  insert into public.admin_roles (user_id, role, created_by) values (v_user, p_role, auth.uid())
  on conflict (user_id) do update set role = excluded.role;
  insert into public.admin_audit_log (admin_id, admin_email, action, target_type, target_id, before, after, reason)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), 'team.role_set', 'admin', v_user::text,
          case when v_before is null then null else jsonb_build_object('role', v_before) end,
          jsonb_build_object('role', p_role, 'email', lower(trim(p_email))), p_reason);
  return jsonb_build_object('user_id', v_user, 'role', p_role);
end;
$$;

create or replace function public.admin_team_remove(p_user uuid, p_reason text default null)
returns void language plpgsql security definer set search_path to '' as $$
declare v_before text;
begin
  perform private.admin_require_role(array['owner']);
  select role into v_before from public.admin_roles where user_id = p_user;
  if v_before is null then return; end if;
  if v_before = 'owner' and (select count(*) from public.admin_roles where role = 'owner') = 1 then
    raise exception 'There must always be at least one owner.';
  end if;
  delete from public.admin_roles where user_id = p_user;
  -- is_admin would otherwise keep them in as owner through the fallback.
  update public.profiles set is_admin = false where id = p_user;
  insert into public.admin_audit_log (admin_id, admin_email, action, target_type, target_id, before, reason)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), 'team.removed', 'admin', p_user::text,
          jsonb_build_object('role', v_before), p_reason);
end;
$$;

create or replace function public.admin_audit_recent(p_limit integer default 100)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
begin
  perform private.admin_require_role(array['owner', 'admin']);
  return coalesce((select jsonb_agg(to_jsonb(a) order by a.at desc) from (
    select at, admin_email, action, target_type, target_id, before, after, reason from public.admin_audit_log
    order by at desc limit least(greatest(coalesce(p_limit, 100), 1), 500)) a), '[]'::jsonb);
end;
$$;

revoke all on function public.admin_team() from public, anon;
revoke all on function public.admin_team_set(text, text, text) from public, anon;
revoke all on function public.admin_team_remove(uuid, text) from public, anon;
revoke all on function public.admin_audit_recent(integer) from public, anon;
grant execute on function public.admin_team() to authenticated;
grant execute on function public.admin_team_set(text, text, text) to authenticated;
grant execute on function public.admin_team_remove(uuid, text) to authenticated;
grant execute on function public.admin_audit_recent(integer) to authenticated;

-- 2. Attribution on the person. First touch only: set once, never overwritten.
alter table public.profiles
  add column if not exists last_seen_at timestamptz,
  add column if not exists signup_source text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer text,
  add column if not exists landing_page text,
  add column if not exists click_ids jsonb,
  add column if not exists attributed_at timestamptz;

create or replace function private.channel_for(p jsonb)
returns text language sql immutable set search_path to '' as $$
  select case
    when coalesce(p -> 'click_ids', '{}'::jsonb) ?| array['gclid', 'fbclid', 'ttclid', 'msclkid', 'gbraid', 'wbraid'] then 'paid'
    when lower(coalesce(p ->> 'utm_medium', '')) in ('cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'display', 'cpm') then 'paid'
    when lower(coalesce(p ->> 'utm_medium', '')) in ('email', 'newsletter') or lower(coalesce(p ->> 'utm_source', '')) in ('email', 'newsletter', 'resend') then 'email'
    when lower(coalesce(p ->> 'utm_medium', '')) in ('partner', 'affiliate') then 'partner'
    when lower(coalesce(p ->> 'utm_medium', '')) in ('social', 'organic_social') then 'social'
    when lower(coalesce(p ->> 'utm_medium', '')) = 'referral' then 'referral'
    when coalesce(p ->> 'referrer', '') ~* '(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex)\.' then 'organic'
    when coalesce(p ->> 'referrer', '') ~* '(facebook|instagram|tiktok|twitter|x\.com|t\.co|linkedin|reddit|pinterest|youtube|threads)\.' then 'social'
    when coalesce(p ->> 'referrer', '') <> '' and coalesce(p ->> 'referrer', '') !~* 'takeitback\.app' then 'referral'
    else 'direct'
  end;
$$;

create or replace function public.record_attribution(p jsonb)
returns void language plpgsql security definer set search_path to '' as $$
declare ids jsonb := '{}'::jsonb; k text;
begin
  if auth.uid() is null or p is null or jsonb_typeof(p) <> 'object' then return; end if;
  foreach k in array array['gclid', 'fbclid', 'ttclid', 'msclkid', 'gbraid', 'wbraid'] loop
    if coalesce(p -> 'click_ids' ->> k, '') <> '' then ids := ids || jsonb_build_object(k, left(p -> 'click_ids' ->> k, 200)); end if;
  end loop;
  update public.profiles set
    utm_source = left(nullif(p ->> 'utm_source', ''), 120),
    utm_medium = left(nullif(p ->> 'utm_medium', ''), 120),
    utm_campaign = left(nullif(p ->> 'utm_campaign', ''), 200),
    utm_content = left(nullif(p ->> 'utm_content', ''), 200),
    utm_term = left(nullif(p ->> 'utm_term', ''), 200),
    referrer = left(nullif(p ->> 'referrer', ''), 500),
    landing_page = left(nullif(p ->> 'landing_page', ''), 500),
    click_ids = case when ids = '{}'::jsonb then null else ids end,
    signup_source = case when referred_by is not null then 'referral' else private.channel_for(p || jsonb_build_object('click_ids', ids)) end,
    attributed_at = now()
  where id = auth.uid() and attributed_at is null;
end;
$$;
revoke all on function public.record_attribution(jsonb) from public, anon;
grant execute on function public.record_attribution(jsonb) to authenticated;

create or replace function public.touch_last_seen()
returns void language sql security definer set search_path to '' as $$
  update public.profiles set last_seen_at = now()
  where id = auth.uid() and (last_seen_at is null or last_seen_at < now() - interval '1 hour');
$$;
revoke all on function public.touch_last_seen() from public, anon;
grant execute on function public.touch_last_seen() to authenticated;

-- 3. Product events, written by triggers. Activation for Take it Back = first letter sent.
create table if not exists public.product_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists product_events_name_created on public.product_events (name, created_at);
create index if not exists product_events_user on public.product_events (user_id, created_at);
alter table public.product_events enable row level security;
revoke all on public.product_events from anon, authenticated;

create or replace function private.pe_on_profile()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.product_events (user_id, name, created_at) values (new.id, 'signup', coalesce(new.created_at, now()));
  elsif new.plan_status is distinct from old.plan_status then
    insert into public.product_events (user_id, name, properties) values (new.id,
      case
        when new.plan_status = 'trialing' then 'trial_started'
        when new.plan_status = 'active' then 'subscribed'
        when new.plan_status = 'past_due' then 'payment_failed'
        when new.plan_status in ('canceled', 'incomplete_expired', 'unpaid') or (new.plan_status is null and old.plan_status in ('active', 'trialing', 'past_due')) then 'canceled'
        else 'subscription_' || coalesce(new.plan_status, 'changed')
      end,
      jsonb_build_object('from', old.plan_status, 'to', new.plan_status, 'source', new.billing_source));
  end if;
  return new;
end;
$$;
create trigger product_events_profile after insert or update of plan_status on public.profiles
  for each row execute function private.pe_on_profile();

create or replace function private.pe_on_case()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if new.is_demo or new.user_id is null then return new; end if;
  insert into public.product_events (user_id, name, properties) values (new.user_id, 'key_action', jsonb_build_object('what', 'case', 'category', new.category));
  return new;
end;
$$;
create trigger product_events_case after insert on public.cases for each row execute function private.pe_on_case();

create or replace function private.pe_on_letter()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if new.user_id is null then return new; end if;
  if tg_op = 'INSERT' then
    insert into public.product_events (user_id, name, properties) values (new.user_id, 'key_action', jsonb_build_object('what', 'letter', 'kind', new.kind));
  end if;
  if new.status = 'sent' and (tg_op = 'INSERT' or old.status is distinct from 'sent')
     and not exists (select 1 from public.product_events e where e.user_id = new.user_id and e.name = 'activated') then
    insert into public.product_events (user_id, name, properties) values (new.user_id, 'activated', jsonb_build_object('letter', new.id));
  end if;
  return new;
end;
$$;
create trigger product_events_letter after insert or update of status on public.letters for each row execute function private.pe_on_letter();

-- Backfill what already happened, once.
insert into public.product_events (user_id, name, created_at)
select p.id, 'signup', p.created_at from public.profiles p
where not exists (select 1 from public.product_events e where e.user_id = p.id and e.name = 'signup');
insert into public.product_events (user_id, name, properties, created_at)
select c.user_id, 'key_action', jsonb_build_object('what', 'case', 'category', c.category, 'backfill', true), c.created_at
from public.cases c where not c.is_demo and c.user_id is not null;
insert into public.product_events (user_id, name, properties, created_at)
select distinct on (l.user_id) l.user_id, 'activated', jsonb_build_object('letter', l.id, 'backfill', true), coalesce(l.sent_at, l.updated_at)
from public.letters l where l.status = 'sent' and l.user_id is not null
  and not exists (select 1 from public.product_events e where e.user_id = l.user_id and e.name = 'activated')
order by l.user_id, coalesce(l.sent_at, l.updated_at);

-- 4. Marketing: campaigns and spend, one row per day, platform and campaign.
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'paid',
  platform text,
  objective text,
  budget_cents bigint,
  daily_budget_cents bigint,
  target_cac_cents bigint,
  utm_campaign text unique,
  start_date date,
  end_date date,
  owner text,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'ended')),
  creative_url text,
  created_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
revoke all on public.campaigns from anon, authenticated;

create table if not exists public.marketing_spend_daily (
  date date not null,
  platform text not null,
  campaign_key text not null default '',
  campaign_id uuid references public.campaigns (id) on delete set null,
  spend_cents bigint not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  conversions bigint not null default 0,
  currency text not null default 'USD',
  source text not null default 'csv',
  imported_at timestamptz not null default now(),
  primary key (date, platform, campaign_key)
);
alter table public.marketing_spend_daily enable row level security;
revoke all on public.marketing_spend_daily from anon, authenticated;

-- 5. One row per day for the central dashboard. The app does not store whether a subscriber pays
-- monthly or yearly, so MRR is left at zero until it does (on the roadmap); paying customers is exact.
create table if not exists public.app_daily_metrics (
  date date primary key,
  app text not null default 'takeitback',
  mrr_cents bigint not null default 0,
  new_mrr_cents bigint not null default 0,
  churned_mrr_cents bigint not null default 0,
  paying_customers integer not null default 0,
  new_signups integer not null default 0,
  active_users integer not null default 0,
  trials_started integer not null default 0,
  spend_cents bigint not null default 0,
  tickets_open integer not null default 0,
  refunds_cents bigint not null default 0,
  computed_at timestamptz not null default now()
);
alter table public.app_daily_metrics enable row level security;
revoke all on public.app_daily_metrics from anon, authenticated;

create or replace function private.compute_daily_metrics(p_from date, p_to date)
returns integer language plpgsql security definer set search_path to '' as $$
declare n integer;
begin
  insert into public.app_daily_metrics as m
    (date, paying_customers, new_signups, active_users, trials_started, spend_cents, tickets_open, computed_at)
  select
    d::date,
    case when d::date = current_date
      then (select count(*) from public.profiles where plan = 'premium' and plan_status in ('active', 'past_due'))
      else greatest(0, (select count(*) from public.product_events e where e.name = 'subscribed' and e.created_at::date <= d::date)
                     - (select count(*) from public.product_events e where e.name = 'canceled' and e.created_at::date <= d::date))::int end,
    (select count(*) from public.product_events e where e.name = 'signup' and e.created_at::date = d::date),
    (select count(distinct e.user_id) from public.product_events e where e.name = 'key_action' and e.created_at::date = d::date),
    (select count(*) from public.product_events e where e.name = 'trial_started' and e.created_at::date = d::date),
    coalesce((select sum(x.spend_cents) from public.marketing_spend_daily x where x.date = d::date), 0),
    (select count(*) from public.support_tickets t where t.created_at::date <= d::date and (t.status = 'open' or t.updated_at::date > d::date)),
    now()
  from generate_series(p_from, p_to, interval '1 day') d
  on conflict (date) do update set
    paying_customers = excluded.paying_customers, new_signups = excluded.new_signups, active_users = excluded.active_users,
    trials_started = excluded.trials_started, spend_cents = excluded.spend_cents, tickets_open = excluded.tickets_open,
    computed_at = excluded.computed_at;
  get diagnostics n = row_count;
  return n;
end;
$$;

select private.compute_daily_metrics((current_date - interval '365 days')::date, current_date);
select cron.schedule('takeitback-daily-metrics', '30 1 * * *', $$select private.compute_daily_metrics(current_date - 3, current_date)$$);

-- 6. Admin reads and writes for the Marketing screen.
create or replace function public.admin_marketing(p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare v_from date := current_date - greatest(1, least(coalesce(p_days, 30), 730)) + 1;
begin
  perform private.admin_require_role(array['owner', 'admin', 'marketing', 'readonly']);
  return jsonb_build_object(
    'from', v_from,
    'channels', coalesce((select jsonb_agg(c order by c ->> 'channel') from (
      select jsonb_build_object(
        'channel', coalesce(p.signup_source, 'unknown'),
        'signups', count(*),
        'activated', count(*) filter (where exists (select 1 from public.product_events e where e.user_id = p.id and e.name = 'activated')),
        'trials', count(*) filter (where exists (select 1 from public.product_events e where e.user_id = p.id and e.name = 'trial_started')),
        'paid', count(*) filter (where exists (select 1 from public.product_events e where e.user_id = p.id and e.name = 'subscribed'))) c
      from public.profiles p where p.created_at::date >= v_from group by coalesce(p.signup_source, 'unknown')) x), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('date', m.date, 'signups', m.new_signups, 'trials', m.trials_started, 'spend_cents', m.spend_cents, 'active', m.active_users) order by m.date)
      from public.app_daily_metrics m where m.date >= v_from), '[]'::jsonb),
    'campaigns', coalesce((select jsonb_agg(r order by (r ->> 'paid')::int desc, (r ->> 'signups')::int desc) from (
      select jsonb_build_object('utm_campaign', p.utm_campaign, 'source', p.utm_source, 'medium', p.utm_medium,
        'signups', count(*),
        'paid', count(*) filter (where exists (select 1 from public.product_events e where e.user_id = p.id and e.name = 'subscribed')),
        'spend_cents', coalesce((select sum(s.spend_cents) from public.marketing_spend_daily s where s.campaign_key = p.utm_campaign and s.date >= v_from), 0)) r
      from public.profiles p where p.created_at::date >= v_from and p.utm_campaign is not null
      group by p.utm_campaign, p.utm_source, p.utm_medium) y), '[]'::jsonb),
    'spend', coalesce((select jsonb_agg(jsonb_build_object('platform', s.platform, 'spend_cents', s.spend, 'impressions', s.imp, 'clicks', s.clk, 'conversions', s.conv) order by s.spend desc)
      from (select platform, sum(spend_cents) spend, sum(impressions) imp, sum(clicks) clk, sum(conversions) conv
            from public.marketing_spend_daily where date >= v_from group by platform) s), '[]'::jsonb),
    'attributed_share', (select round(100.0 * count(*) filter (where attributed_at is not null) / nullif(count(*), 0)) from public.profiles where created_at::date >= v_from),
    'new_paying', (select count(*) from public.product_events where name = 'subscribed' and created_at::date >= v_from),
    'campaign_list', coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at desc) from public.campaigns c), '[]'::jsonb)
  );
end;
$$;

create or replace function public.admin_import_spend(p_rows jsonb)
returns integer language plpgsql security definer set search_path to '' as $$
declare n integer;
begin
  perform private.admin_require_role(array['owner', 'admin', 'marketing']);
  insert into public.marketing_spend_daily as m (date, platform, campaign_key, campaign_id, spend_cents, impressions, clicks, conversions, source, imported_at)
  select (r ->> 'date')::date, lower(left(r ->> 'platform', 40)), coalesce(left(r ->> 'campaign', 200), ''),
    (select c.id from public.campaigns c where c.utm_campaign = r ->> 'campaign'),
    round(coalesce((r ->> 'spend')::numeric, 0) * 100)::bigint, coalesce((r ->> 'impressions')::bigint, 0),
    coalesce((r ->> 'clicks')::bigint, 0), coalesce((r ->> 'conversions')::bigint, 0), 'csv', now()
  from jsonb_array_elements(p_rows) r
  where (r ->> 'date') is not null and (r ->> 'platform') is not null
  on conflict (date, platform, campaign_key) do update set
    spend_cents = excluded.spend_cents, impressions = excluded.impressions, clicks = excluded.clicks,
    conversions = excluded.conversions, campaign_id = excluded.campaign_id, source = excluded.source, imported_at = now();
  get diagnostics n = row_count;
  perform private.compute_daily_metrics(
    (select min((r ->> 'date')::date) from jsonb_array_elements(p_rows) r),
    (select max((r ->> 'date')::date) from jsonb_array_elements(p_rows) r));
  insert into public.admin_audit_log (admin_id, admin_email, action, target_type, after)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), 'marketing.spend_import', 'spend', jsonb_build_object('rows', n));
  return n;
end;
$$;

create or replace function public.admin_campaign_save(p jsonb)
returns uuid language plpgsql security definer set search_path to '' as $$
declare v uuid; v_before jsonb;
begin
  perform private.admin_require_role(array['owner', 'admin', 'marketing']);
  select to_jsonb(c) into v_before from public.campaigns c where c.id = (p ->> 'id')::uuid;
  insert into public.campaigns (id, name, channel, platform, objective, budget_cents, daily_budget_cents, target_cac_cents, utm_campaign, start_date, end_date, owner, status, creative_url)
  values (coalesce((p ->> 'id')::uuid, gen_random_uuid()), left(p ->> 'name', 200), coalesce(nullif(p ->> 'channel', ''), 'paid'),
    nullif(p ->> 'platform', ''), nullif(p ->> 'objective', ''), (p ->> 'budget_cents')::bigint, (p ->> 'daily_budget_cents')::bigint,
    (p ->> 'target_cac_cents')::bigint, nullif(p ->> 'utm_campaign', ''), (p ->> 'start_date')::date, (p ->> 'end_date')::date,
    nullif(p ->> 'owner', ''), coalesce(nullif(p ->> 'status', ''), 'active'), nullif(p ->> 'creative_url', ''))
  on conflict (id) do update set
    name = excluded.name, channel = excluded.channel, platform = excluded.platform, objective = excluded.objective,
    budget_cents = excluded.budget_cents, daily_budget_cents = excluded.daily_budget_cents, target_cac_cents = excluded.target_cac_cents,
    utm_campaign = excluded.utm_campaign, start_date = excluded.start_date, end_date = excluded.end_date, owner = excluded.owner,
    status = excluded.status, creative_url = excluded.creative_url
  returning id into v;
  insert into public.admin_audit_log (admin_id, admin_email, action, target_type, target_id, before, after)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), 'marketing.campaign_save', 'campaign', v::text, v_before,
          (select to_jsonb(c) from public.campaigns c where c.id = v));
  return v;
end;
$$;

revoke all on function public.admin_marketing(integer) from public, anon;
revoke all on function public.admin_import_spend(jsonb) from public, anon;
revoke all on function public.admin_campaign_save(jsonb) from public, anon;
grant execute on function public.admin_marketing(integer) to authenticated;
grant execute on function public.admin_import_spend(jsonb) to authenticated;
grant execute on function public.admin_campaign_save(jsonb) to authenticated;
