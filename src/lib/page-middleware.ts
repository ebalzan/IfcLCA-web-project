import { NextResponse, NextRequest } from 'next/server'
import type { ClerkMiddlewareAuth } from '@clerk/nextjs/server'
import { isPublicRoute, isProtectedRoute, isApiRoute } from './route-config'

/**
 * Page middleware function that handles page-level authentication and routing
 */
export async function pageMiddleware(
  auth: ClerkMiddlewareAuth,
  request: NextRequest
): Promise<NextResponse> {
  const { userId } = await auth()
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check if it's a protected route (non-API)
  const isProtected = isProtectedRoute(pathname)

  // Check if it's an API route
  const isApi = isApiRoute(pathname)

  if (isProtected || isApi) {
    if (!userId) {
      // For API routes, let the API middleware handle the 401 response
      if (isApi) {
        return NextResponse.next() // Let API middleware handle auth
      }

      // For other routes, redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check terms acceptance for non-API routes only
    if (!isApi) {
      const hasAcceptedTerms = request.cookies.get('terms_accepted')
      if (!hasAcceptedTerms) {
        const url = new URL('/', request.url)
        url.searchParams.set('redirect', request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}
