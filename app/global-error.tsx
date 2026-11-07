"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>We have been told about it. Please reload the page.</p>
        {error.digest ? <p style={{ color: "#666" }}>Reference: {error.digest}</p> : null}
      </body>
    </html>
  );
}
