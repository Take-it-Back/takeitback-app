import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

/* Browser monitoring. Both are off until their key is set in Vercel:
 *   NEXT_PUBLIC_SENTRY_DSN   - a Sentry DSN (write-only, safe in the browser)
 *   NEXT_PUBLIC_POSTHOG_KEY  - a PostHog project key (public by design)
 * Nothing sensitive goes here: those two are the only values read. */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
  });
}

const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (phKey) {
  posthog.init(phKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
  });
  // Every event says which app and which surface it came from (docs/analytics-events.md).
  posthog.register({ app: "takeitback", platform: "web" });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
