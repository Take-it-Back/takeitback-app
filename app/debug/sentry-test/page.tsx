import { notFound } from "next/navigation";
import { sentryTestOpen } from "@/lib/sentryTest";
import ThrowOnMount from "./ThrowOnMount";

// Deliberate browser error to prove Sentry receives browser errors. Open only while SENTRY_TEST_UNTIL is in the future.
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function SentryTestPage() {
  if (!sentryTestOpen()) notFound();
  return (
    <main style={{ padding: 32 }}>
      <p>Sending a test error to Sentry from the browser.</p>
      <ThrowOnMount />
    </main>
  );
}
