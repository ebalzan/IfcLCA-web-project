import { clerkMiddleware } from '@clerk/nextjs/server'
import { pageMiddleware } from '@/lib/page-middleware'

// Use the page middleware that handles page-level authentication and routing
export default clerkMiddleware(pageMiddleware)

// Matcher pattern
export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/sign-up',
    '/dashboard/:path*',
    '/projects/:path*',
    '/materials/:path*',
    '/settings/:path*',
    '/reports/:path*',
    '/api/:path*',
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
