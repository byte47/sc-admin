import { stackServerApp } from "./stack";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip auth protection for auth handler routes
  if (request.nextUrl.pathname.startsWith("/handler")) {
    return NextResponse.next();
  }

  // Get the user from the request
  const user = await stackServerApp.getUser({ tokenStore: request });

  // If no user is found, redirect to sign in
  if (!user) {
    const signInUrl = new URL("/handler/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
