import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
}

export type AuthHandler = (
  request: AuthenticatedRequest,
  context?: unknown
) => Promise<NextResponse>

export type AuthHandlerWithParams<T> = (
  request: AuthenticatedRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>

/**
 * Auth middleware that only handles authentication
 */
export function withAuth(handler: AuthHandler): AuthHandler {
  return async (request: NextRequest, context?: unknown) => {
    try {
      // Authenticate user
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Add userId to request object
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.userId = userId

      // Call the original handler
      return await handler(authenticatedRequest, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

/**
 * Auth middleware for routes with dynamic parameters
 */
export function withAuthParams<T>(handler: AuthHandlerWithParams<T>): AuthHandlerWithParams<T> {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    try {
      // Authenticate user
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Add userId to request object
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.userId = userId

      // Call the original handler
      return await handler(authenticatedRequest, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

/**
 * Helper function to get authenticated user ID from request
 */
export function getUserId(request: AuthenticatedRequest): string {
  return request.userId
}
