import * as Sentry from "@sentry/nextjs";

// Server and edge error reporting. Off until SENTRY_DSN is set in Vercel (server only).
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0,
  });
}

export const onRequestError = Sentry.captureRequestError;
