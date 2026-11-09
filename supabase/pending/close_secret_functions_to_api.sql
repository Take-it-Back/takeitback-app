-- NOT APPLIED. Apply only after SUPABASE_SECRET_KEY is live in both Vercel projects and /api/health shows secret_key: true.
-- The server then calls these with the secret key, so the public API no longer needs them. Each still checks BILLING_SECRET.
revoke execute on function public.billing_apply(text, uuid, text, text, text, timestamptz) from anon, authenticated;
revoke execute on function public.billing_apply_apple(text, uuid, text, text, timestamptz, timestamptz) from anon, authenticated;
revoke execute on function public.billing_apply_google(text, uuid, text, text, timestamptz, timestamptz) from anon, authenticated;
revoke execute on function public.grant_case_pass(text, uuid, uuid, text, text, integer, integer) from anon, authenticated;
revoke execute on function public.revoke_case_pass(text, text) from anon, authenticated;
revoke execute on function public.referral_bank_month(text, uuid, integer) from anon, authenticated;
revoke execute on function public.referral_reward(text, uuid) from anon, authenticated;
revoke execute on function public.send_set_status(text, uuid, text, text, text) from anon, authenticated;
revoke execute on function public.stripe_event_done(text, text, text) from anon, authenticated;
revoke execute on function public.stripe_event_seen(text, text) from anon, authenticated;
revoke execute on function public.support_inbound(text, text, text, text, text, text, text) from anon, authenticated;
-- Then remove these names from anon_ok in tests/rls/rls.sql.
