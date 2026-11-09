/* One event list for web and phone apps, shared by all eight apps (see
 * docs/analytics-events.md). Same names everywhere, so a funnel reads the same
 * in every app. Add to this list rather than inventing a name at the call site. */
export const APP = "takeitback";

export const EVENTS = {
  signedUp: "signed_up",
  signedIn: "signed_in",
  onboardingCompleted: "onboarding_completed",
  activated: "activated",
  keyAction: "key_action",
  paywallViewed: "paywall_viewed",
  trialStarted: "trial_started",
  subscribed: "subscribed",
  subscriptionCanceled: "subscription_canceled",
  inviteSent: "invite_sent",
  feedbackSent: "feedback_sent",
  signedOut: "signed_out",
  accountDeleted: "account_deleted",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** Send an event from the browser. Does nothing until PostHog is switched on. */
export function track(event: EventName, props?: Record<string, string | number | boolean | null>): void {
  if (typeof window === "undefined") return;
  void import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) posthog.capture(event, props);
  });
}

/** Tie events to a signed-in person. Id only, prefixed with the app; never an email or name. */
export function identify(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  void import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) posthog.identify(`${APP}:${userId}`);
  });
}

/** On sign-out, so the next person on this browser is not tied to the last. */
export function forget(): void {
  if (typeof window === "undefined") return;
  void import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) posthog.reset();
  });
}
