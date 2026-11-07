import { NextResponse } from "next/server";

// The oldest phone app version still allowed. Set MIN_SUPPORTED_APP_VERSION in Vercel (for example "1.2.0").
// Unset means no minimum. Read by UpdateGate in the phone app.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ min: process.env.MIN_SUPPORTED_APP_VERSION || "0.0.0" }, { headers: { "Cache-Control": "no-store" } });
}
