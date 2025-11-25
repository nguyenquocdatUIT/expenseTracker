import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // // Protect dashboard and app routes
  // if (
  //   request.nextUrl.pathname.startsWith("/dashboard") ||
  //   request.nextUrl.pathname.startsWith("/transactions") ||
  //   request.nextUrl.pathname.startsWith("/budgets") ||
  //   request.nextUrl.pathname.startsWith("/analytics") ||
  //   request.nextUrl.pathname.startsWith("/profile")
  // ) {
  //   if (!session) {
  //     return NextResponse.redirect(new URL("/auth/signin", request.url));
  //   }
  // }

  // // Redirect authenticated users away from auth pages
  // if (
  //   request.nextUrl.pathname.startsWith("/auth/signin") ||
  //   request.nextUrl.pathname.startsWith("/auth/register")
  // ) {
  //   if (session) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/analytics/:path*",
    "/profile/:path*",
    "/auth/signin",
    "/auth/register",
  ],
};
