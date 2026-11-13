import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publishableKey, supabaseUrl } from "@/lib/supabase/keys";

const isAdminHost = (h: string | null) => (h ?? "").toLowerCase().startsWith("admin.");

export async function middleware(request: NextRequest) {
  // admin.takeitback.app serves only the admin (Admin Dashboard Build Directions, Section 2):
  // "/" there is /app/admin, sign-in still works, and everything else is not found.
  const host = request.headers.get("host");
  const rawPath = request.nextUrl.pathname;
  if (isAdminHost(host)) {
    if (rawPath === "/robots.txt") return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
    if (rawPath !== "/login" && !rawPath.startsWith("/auth/") && !rawPath.startsWith("/app/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/admin" + (rawPath === "/" ? "" : rawPath);
      return NextResponse.redirect(url);
    }
  }

  // Public pages: nothing to do here (the session refresh only matters for the app and sign-in).
  if (!isAdminHost(host) && !rawPath.startsWith("/app") && rawPath !== "/login") return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl(),
    publishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verifies the token locally and refreshes it when it is about to expire.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? data.claims : null;

  const path = request.nextUrl.pathname;
  if (!user && path.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    const out = NextResponse.redirect(url);
    if (isAdminHost(host)) out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  }
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = isAdminHost(host) ? "/app/admin" : "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }
  // Came from the Spanish page: remember it so new accounts start with Spanish explanations.
  if (path === "/login" && request.nextUrl.searchParams.get("lang") === "es") {
    response.cookies.set("tib_lang", "es", { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
  }
  if (isAdminHost(host)) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Everything except static files, so the admin host can route its own paths.
  matcher: ["/((?!_next/|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?|txt|xml|json|webmanifest)$).*)", "/robots.txt"],
};
