import { clerkMiddleware } from "@clerk/nextjs/server";
import { pageMiddleware } from "@/lib/page-middleware";

// Use the page middleware that handles page-level authentication and routing
export default clerkMiddleware(pageMiddleware);

// Fixed matcher pattern
export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/dashboard/:path*",
    "/projects/:path*",
    "/materials/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
