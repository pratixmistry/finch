import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/signup", "/reset-password", "/update-password"];
const DEFAULT_AUTHENTICATED_ROUTE = "/overview";
const DEFAULT_UNAUTHENTICATED_ROUTE = "/login";

// Refreshes the Supabase auth session on every request and enforces route
// protection at the edge — this is the real gate, not just a UI convenience.
// RLS is the last line of defense; this is the first.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = pathname === "/" || isAuthRoute || pathname.startsWith("/auth/");

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_UNAUTHENTICATED_ROUTE;
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && pathname !== "/update-password") {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_ROUTE;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
