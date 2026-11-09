-- Applied 2026-11-09. Trigger functions are never called through the API; Postgres checks EXECUTE on a trigger
-- function only when the trigger is created, so revoking it does not stop the triggers firing.
revoke execute on function public.guard_case_insert() from public, anon, authenticated;
revoke execute on function public.guard_send() from public, anon, authenticated;
revoke execute on function public.guard_share_insert() from public, anon, authenticated;
revoke execute on function public.guard_win_insert() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.enforce_free_case_limit() from public, anon, authenticated;
revoke execute on function public.set_case_owner() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.case_pass_active(uuid) from public, anon, authenticated;
revoke execute on function public.billing_apply_apple(text, uuid, text, text, timestamptz) from public, anon, authenticated;
