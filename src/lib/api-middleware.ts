import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { sendApiErrorResponse } from './api-error-response'
import { logger } from './logger'
import { connectToDatabase } from './mongodb'
import { validateQueryParams } from './validation-middleware'
import { ValidationContext } from './validation-middleware/types'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
}

export type ApiHandler = (request: AuthenticatedRequest) => Promise<NextResponse>

export type ApiHandlerWithContext<PATH_PARAMS, QUERY_PARAMS> = (
  request: AuthenticatedRequest,
  context: ValidationContext<PATH_PARAMS, QUERY_PARAMS>
) => Promise<NextResponse>

export type PublicApiHandler = (request: NextRequest) => Promise<NextResponse>

export type PublicApiHandlerWithContext<PATH_PARAMS, QUERY_PARAMS> = (
  request: NextRequest,
  context: ValidationContext<PATH_PARAMS, QUERY_PARAMS>
) => Promise<NextResponse>

/**
 * Helper function to get authenticated user ID from request
 */
export function getUserId(request: AuthenticatedRequest): string {
  return request.userId
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
 * API middleware that uses Clerk auth and adds database connection with enhanced error handling
 */
export function withAuthAndDBWithPathParams<PATH_PARAMS>(
  handler: ApiHandlerWithContext<PATH_PARAMS, never>
): ApiHandlerWithContext<PATH_PARAMS, never> {
  return async (request: NextRequest, context: ValidationContext<PATH_PARAMS, never>) => {
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
      logger.error('❌ [API Middleware] Error in withAuthAndDBWithPathParams:', error)
      return sendApiErrorResponse(error, request, { operation: 'middleware' })
    }
  }
}

/**
 * API middleware that uses Clerk auth and adds database connection with enhanced error handling
 */
export function withAuthAndDBWithQueryParams<QUERY_PARAMS>(
  queryParamsSchema: z.ZodSchema<QUERY_PARAMS>,
  handler: ApiHandlerWithContext<never, QUERY_PARAMS>
): ApiHandlerWithContext<never, QUERY_PARAMS> {
  return async (request: NextRequest, context: ValidationContext<never, QUERY_PARAMS>) => {
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

      // Create the context here
      const validatedQueryParams = validateQueryParams(queryParamsSchema, authenticatedRequest)
      const queryContext: ValidationContext<never, QUERY_PARAMS> = {
        params: Promise.resolve({} as never),
        query: validatedQueryParams,
      }

      return await handler(authenticatedRequest, queryContext)
    } catch (error: unknown) {
      logger.error('❌ [API Middleware] Error in withAuthAndDBWithQueryParams:', error)
      return sendApiErrorResponse(error, request, { operation: 'middleware' })
    }
  }
}
