import { NextResponse } from "next/server";
import { sentryTestOpen } from "@/lib/sentryTest";

// Deliberate server error to prove Sentry receives server-side errors with the right release.
// Open only while SENTRY_TEST_UNTIL is in the future (see lib/sentryTest.ts); 404 otherwise.
export const dynamic = "force-dynamic";

export function GET() {
  if (!sentryTestOpen()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  throw new Error(`Sentry server test error (release ${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"})`);
}
