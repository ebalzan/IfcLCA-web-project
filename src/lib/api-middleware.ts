import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from './mongodb'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
}

export type ApiHandler = (request: AuthenticatedRequest) => Promise<NextResponse>

export type ApiHandlerWithParams<T> = (
  request: AuthenticatedRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>

export type PublicApiHandler = (request: NextRequest) => Promise<NextResponse>

export type PublicApiHandlerWithParams<T> = (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>

/**
 * API middleware that uses Clerk auth and adds database connection
 */
export function withAuthAndDB(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest) => {
    try {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      await connectToDatabase()

      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.userId = userId

      return await handler(authenticatedRequest)
    } catch (error: unknown) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * API middleware for routes with dynamic parameters
 */
export function withAuthAndDBParams<T>(handler: ApiHandlerWithParams<T>): ApiHandlerWithParams<T> {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    try {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      await connectToDatabase()

      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.userId = userId

      return await handler(authenticatedRequest, context)
    } catch (error) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Middleware wrapper for public API routes that only need database connection
 */
export function withDB(handler: PublicApiHandler): PublicApiHandler {
  return async (request: NextRequest) => {
    try {
      await connectToDatabase()

      return await handler(request)
    } catch (error) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      await connectToDatabase()

      return await handler(request, context)
    } catch (error) {
      console.error('API middleware error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Helper function to get authenticated user ID from request
 */
export function getUserId(request: AuthenticatedRequest): string {
  return request.userId
}
