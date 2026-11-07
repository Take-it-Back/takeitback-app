/* One event list for web and phone apps. Same names in every app, so a funnel
 * reads the same everywhere. Add to this list rather than inventing a name at
 * the call site. */
export const EVENTS = {
  signUp: "sign_up",
  signIn: "sign_in",
  signOut: "sign_out",
  accountDeleted: "account_deleted",
  checkoutStarted: "checkout_started",
  purchaseCompleted: "purchase_completed",
  pushOptIn: "push_opt_in",
  shareClicked: "share_clicked",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** Send an event from the browser. Does nothing until PostHog is switched on. */
export function track(event: EventName, props?: Record<string, string | number | boolean | null>): void {
  if (typeof window === "undefined") return;
  void import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) posthog.capture(event, props);
  });
}
