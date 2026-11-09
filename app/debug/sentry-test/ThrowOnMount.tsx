"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function ThrowOnMount() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const eventId = Sentry.captureException(new Error("Sentry browser test error"));
    setId(eventId);
    void Sentry.flush(3000);
  }, []);
  return <p data-testid="sentry-event">{id ? `Sent: ${id}` : "Sending…"}</p>;
}
