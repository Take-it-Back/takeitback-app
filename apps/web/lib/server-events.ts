/* Send a product event from the server (sign-in happens in a server action, where the browser
 * helper cannot run). Same project, same app and platform tags as the browser. Fire and forget:
 * analytics never blocks or breaks a request. Person id only, never an email or name. */
const APP = "takeitback";

export async function serverTrack(event: string, userId: string | undefined, props: Record<string, string | number | boolean> = {}): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || !userId) return;
  try {
    await fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: `${APP}:${userId}`,
        properties: { app: APP, platform: "web", ...props },
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    /* ignore */
  }
}
