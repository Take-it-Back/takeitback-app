# Database access review, 9 Nov 2026

## SECURITY DEFINER functions

**Closed today (no longer callable through the API):** guard_case_insert, guard_send, guard_share_insert,
guard_win_insert, touch_updated_at, enforce_free_case_limit, set_case_owner, handle_new_user (all trigger functions;
the triggers still fire), case_pass_active (unused), the old 5-argument billing_apply_apple.
New functions are no longer runnable by signed-out callers by default.

**Callable signed out, on purpose (16):**

| Function | Why it is safe |
|---|---|
| billing_apply, billing_apply_apple, billing_apply_google, grant_case_pass, revoke_case_pass, referral_bank_month, referral_reward, send_set_status, stripe_event_seen, stripe_event_done, support_inbound | Each checks BILLING_SECRET against its SHA-256 in private.config before doing anything. Called by webhooks that have no signed-in user. To be closed to the API once SUPABASE_SECRET_KEY is live (supabase/pending/close_secret_functions_to_api.sql). |
| support_create, support_guest_thread, support_reply, support_set_status | Guest support. Guests act only on their own ticket through its random guest token; signed-in users only on their own tickets (fixed Oct 26). |
| uptime_status | Feeds the public /status page. Read-only, no personal data. |

**Callable only when signed in (21 definer + owns_case):** each acts on the caller's own rows (auth.uid()) or checks
admin rights inside: admin_ai_costs and admin_overview require an admin with two-step login (aal2); support_admin_list and
support_admin_thread require support staff; is_case_owner, is_case_helper, case_premium, claim_case_shares,
claim_device_token, claim_referral, delete_my_account, save_apple_refresh_token, take_apple_refresh_token,
set_health_consent, set_renewal_consent, set_sms_consent, support_mark_read, unlock_case_deadlines.
admin_activation and admin_db_stats are not callable through the API at all.

## Tables with RLS on and no policy (server-only)

agency_leads, roadmap_items, portfolio_goals, portfolio_issues, portfolio_messages, portfolio_plan.
None is read or written by the Take it Back app. They hold the studio's agency leads and the portfolio dashboard's data,
read with the secret key only. Deny-all to the public API is correct. The RLS test fails if a new table has no policy
and is not on this list.

## Other

- Users cannot change their own plan, billing fields, admin flag or consent dates: those columns are not granted for
  update (column privileges). Covered by the RLS test.
- pg_net is still registered in the public schema. Moving it means dropping and re-creating the extension, which needs
  approval; see the roadmap item. Its functions live in the `net` schema either way.
- Leaked-password protection is still off (Austin, one switch in Supabase → Authentication).
