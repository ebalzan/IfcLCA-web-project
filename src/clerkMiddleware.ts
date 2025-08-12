import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes using Clerk's route matcher
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/terms',
  '/privacy',
  '/cookies',
  '/api/accept-terms(.*)',
  '/api/ec3(.*)',
])

// Define routes that require terms acceptance
const requiresTermsAcceptance = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/materials(.*)',
  '/settings(.*)',
  '/reports(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Allow public routes to pass through
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For protected routes, check terms acceptance
  if (userId && requiresTermsAcceptance(req)) {
    const hasAcceptedTerms = req.cookies.get('terms_accepted')

    if (!hasAcceptedTerms) {
      const url = new URL('/', req.url)
      url.searchParams.set('redirect', req.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

// Simplified matcher - Clerk handles most of the routing logic
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
