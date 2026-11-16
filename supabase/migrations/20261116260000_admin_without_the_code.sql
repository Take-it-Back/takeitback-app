-- Austin, 16 Nov: no authenticator step on the admin. Same checks, minus aal2.
create or replace function public.admin_ai_costs()
returns table(kind text, calls bigint, avg_in numeric, avg_out numeric, model text)
language plpgsql stable security definer set search_path to '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then raise exception 'not allowed'; end if;
  return query select a.kind, count(*), round(avg(a.input_tokens)), round(avg(a.output_tokens)), max(a.model)
    from public.ai_calls a where a.created_at > now() - interval '30 days' group by a.kind order by a.kind;
end; $$;

create or replace function private.support_is_staff()
returns boolean language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin);
$$;

create or replace function private.admin_role()
returns text language sql stable security definer set search_path to '' as $$
  select coalesce(
    (select r.role from public.admin_roles r where r.user_id = auth.uid()),
    (select 'owner' from public.profiles p where p.id = auth.uid() and p.is_admin));
$$;
