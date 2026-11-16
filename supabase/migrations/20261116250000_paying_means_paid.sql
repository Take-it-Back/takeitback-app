-- The daily numbers counted any Premium profile as paying, including one with
-- no Stripe subscription and no store purchase behind it (a granted account).
-- Paying now means Premium with a billing source or a Stripe subscription, and
-- today's row gets an MRR estimate from the published prices: $14.99 a month,
-- $59 a year on the web, $59.99 a year in the stores. There is no interval
-- column, so a period ending more than 40 days out is read as yearly.

create or replace function private.compute_daily_metrics(p_from date, p_to date)
returns integer language plpgsql security definer set search_path to '' as $$
declare n integer;
begin
  insert into public.app_daily_metrics as m
    (date, mrr_cents, paying_customers, new_signups, active_users, trials_started, spend_cents, tickets_open, computed_at)
  select
    d::date,
    case when d::date = current_date then coalesce((
      select sum(case
        when p.current_period_end > now() + interval '40 days'
          then case when p.billing_source in ('apple', 'google') then 5999 else 5900 end / 12
        else 1499 end)
      from public.profiles p
      where p.plan = 'premium' and p.plan_status in ('active', 'past_due')
        and (p.billing_source is not null or p.stripe_subscription_id is not null)), 0)
    else coalesce(m0.mrr_cents, 0) end,
    case when d::date = current_date
      then (select count(*) from public.profiles p where p.plan = 'premium' and p.plan_status in ('active', 'past_due')
              and (p.billing_source is not null or p.stripe_subscription_id is not null))
      else greatest(0, (select count(*) from public.product_events e where e.name = 'subscribed' and e.created_at::date <= d::date)
                     - (select count(*) from public.product_events e where e.name = 'canceled' and e.created_at::date <= d::date))::int end,
    (select count(*) from public.product_events e where e.name = 'signup' and e.created_at::date = d::date),
    (select count(distinct e.user_id) from public.product_events e where e.name = 'key_action' and e.created_at::date = d::date),
    (select count(*) from public.product_events e where e.name = 'trial_started' and e.created_at::date = d::date),
    coalesce((select sum(x.spend_cents) from public.marketing_spend_daily x where x.date = d::date), 0),
    (select count(*) from public.support_tickets t where t.created_at::date <= d::date and (t.status = 'open' or t.updated_at::date > d::date)),
    now()
  from generate_series(p_from, p_to, interval '1 day') d
  left join public.app_daily_metrics m0 on m0.date = d::date
  on conflict (date) do update set
    mrr_cents = excluded.mrr_cents, paying_customers = excluded.paying_customers, new_signups = excluded.new_signups,
    active_users = excluded.active_users, trials_started = excluded.trials_started, spend_cents = excluded.spend_cents,
    tickets_open = excluded.tickets_open, computed_at = excluded.computed_at;
  get diagnostics n = row_count;
  return n;
end;
$$;

select private.compute_daily_metrics(current_date - 3, current_date);
