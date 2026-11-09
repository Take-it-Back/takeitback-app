/** The Sentry test error page and route are open only until the time in SENTRY_TEST_UNTIL (an ISO date, at most
 *  two hours ahead). Set it in Vercel, deploy, run the test, then delete it. Unset or past means 404. */
export function sentryTestOpen(now = Date.now()): boolean {
  const until = Date.parse(process.env.SENTRY_TEST_UNTIL || "");
  return Number.isFinite(until) && until > now && until - now <= 2 * 60 * 60 * 1000;
}
