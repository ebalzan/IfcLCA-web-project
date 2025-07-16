import { NextRequest, NextResponse } from 'next/server'
import {
  withAuth,
  withAuthParams,
  AuthenticatedRequest,
  AuthHandler,
  AuthHandlerWithParams,
} from './auth-middleware'
import { connectToDatabase } from './mongodb'

export type ApiHandler = AuthHandler
export type ApiHandlerWithParams<T> = AuthHandlerWithParams<T>
export type PublicApiHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse>

export type PublicApiHandlerWithParams<T> = (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>

/**
 * API middleware that uses auth middleware and adds database connection
 */
export function withAuthAndDB(handler: ApiHandler): ApiHandler {
  // First apply auth middleware, then add database connection
  const authHandler = withAuth(async (request: AuthenticatedRequest, context?: unknown) => {
    try {
      // Connect to database
      await connectToDatabase()

      // Call the original handler
      return await handler(request, context)
    } catch (error: unknown) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'ERROR: ' + error }, { status: 500 })
    }
  })

  return authHandler
}

/**
 * API middleware for routes with dynamic parameters
 */
export function withAuthAndDBParams<T>(handler: ApiHandlerWithParams<T>): ApiHandlerWithParams<T> {
  // First apply auth middleware, then add database connection
  const authHandler = withAuthParams(
    async (request: AuthenticatedRequest, context: { params: Promise<T> }) => {
      try {
        // Connect to database
        await connectToDatabase()

        // Call the original handler
        return await handler(request, context)
      } catch (error) {
        console.error('API middleware error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
    }
  )

  return authHandler
}

/**
 * Middleware wrapper for public API routes that only need database connection
 */
export function withDB(handler: PublicApiHandler): PublicApiHandler {
  return async (request: NextRequest, context?: unknown) => {
    try {
      // Connect to database
      await connectToDatabase()

      // Call the original handler
      return await handler(request, context)
    } catch (error) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'ERROR: ' + error }, { status: 500 })
    }
  }
}

/**
 * Middleware wrapper for public API routes with dynamic parameters
 */
export function withDBParams<T>(
  handler: PublicApiHandlerWithParams<T>
): PublicApiHandlerWithParams<T> {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    try {
      // Connect to database
      await connectToDatabase()

      // Call the original handler
      return await handler(request, context)
    } catch (error) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'ERROR: ' + error }, { status: 500 })
    }
  }
}

/**
 * Helper function to handle common API errors
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }
    if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.json({ error: 'ERROR: ' + error }, { status: 500 })
}
