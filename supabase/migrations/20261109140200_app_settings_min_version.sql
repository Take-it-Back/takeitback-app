-- Applied 2026-11-09. Public settings the phone apps read at launch (forced-update gate).
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  note text,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy "Anyone can read app settings" on public.app_settings for select to anon, authenticated using (true);
revoke insert, update, delete on public.app_settings from anon, authenticated;
insert into public.app_settings (key, value, note) values
  ('min_supported_version_ios', '0.0.0', 'Oldest iPhone app version still allowed. Older versions see an update screen.'),
  ('min_supported_version_android', '0.0.0', 'Oldest Android app version still allowed. Older versions see an update screen.')
on conflict (key) do nothing;
