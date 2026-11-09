"use client";

import { useEffect } from "react";
import { track, EVENTS } from "@/lib/product-events";

/* Fires one product event when a page is shown, for server-rendered screens like the paywall. */
export default function TrackView({ event }: { event: keyof typeof EVENTS }) {
  useEffect(() => {
    track(EVENTS[event]);
  }, [event]);
  return null;
}
