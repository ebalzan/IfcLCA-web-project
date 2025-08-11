import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendApiErrorResponse } from './api-error-response'
import { logger } from './logger'
import { connectToDatabase } from './mongodb'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
}

export type ApiHandler = (request: AuthenticatedRequest) => Promise<NextResponse>

export type ApiHandlerWithParams<P, Q> = (
  request: AuthenticatedRequest,
  context: { pathParams: Promise<P>; queryParams: Promise<Q> }
) => Promise<NextResponse>

export type PublicApiHandler = (request: NextRequest) => Promise<NextResponse>

export type PublicApiHandlerWithParams<P, Q> = (
  request: NextRequest,
  context: { pathParams: Promise<P>; queryParams: Promise<Q> }
) => Promise<NextResponse>

/**
 * API middleware that uses Clerk auth and adds database connection with enhanced error handling
 */
export function withAuthAndDB(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest) => {
    try {
      const { userId } = await auth()
      if (!userId) {
        return sendApiErrorResponse(new Error('Authentication required'), request, {
          operation: 'authenticate',
        })
      }

      await connectToDatabase()

      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.userId = userId

      return await handler(authenticatedRequest)
    } catch (error: unknown) {
      logger.error('❌ [API Middleware] Error in withAuthAndDB:', error)
      return sendApiErrorResponse(error, request, { operation: 'middleware' })
    }
  }
}

/**
 * API middleware for routes with dynamic parameters
 */
export function withAuthAndDBParams<P, Q>(
  handler: ApiHandlerWithParams<P, Q>
): ApiHandlerWithParams<P, Q> {
  return async (
    request: NextRequest,
    context: { pathParams: Promise<P>; queryParams: Promise<Q> }
  ) => {
    try {
      const { userId } = await auth()
      if (!userId) {
        return sendApiErrorResponse(new Error('Authentication required'), request, {
          operation: 'authenticate',
        })
      }

      await connectToDatabase()

      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.userId = userId

      return await handler(authenticatedRequest, context)
    } catch (error: unknown) {
      logger.error('❌ [API Middleware] Error in withAuthAndDBParams:', error)
      return sendApiErrorResponse(error, request, { operation: 'middleware' })
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
    } catch (error: unknown) {
      logger.error('❌ [API Middleware] Error in withDB:', error)
      return sendApiErrorResponse(error, request, { operation: 'middleware' })
    }
  }
}

/**
 * Middleware wrapper for public API routes with dynamic parameters
 */
export function withDBParams<P, Q>(
  handler: PublicApiHandlerWithParams<P, Q>
): PublicApiHandlerWithParams<P, Q> {
  return async (
    request: NextRequest,
    context: { pathParams: Promise<P>; queryParams: Promise<Q> }
  ) => {
    try {
      await connectToDatabase()
      return await handler(request, context)
    } catch (error: unknown) {
      logger.error('❌ [API Middleware] Error in withDBParams:', error)
      return sendApiErrorResponse(error, request, { operation: 'middleware' })
    }
  }
}

/**
 * Helper function to get authenticated user ID from request
 */
export function getUserId(request: AuthenticatedRequest): string {
  return request.userId
}
