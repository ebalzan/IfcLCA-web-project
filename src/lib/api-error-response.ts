import { NextResponse } from 'next/server'
import { AppError, isAppError } from './errors'
import { logger } from './logger'

export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  code?: string
  statusCode: number
  details?: unknown
  meta: {
    timestamp: string
    path?: string
    method?: string
    requestId?: string
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message: string
  meta: {
    timestamp: string
    path?: string
    method?: string
    requestId?: string
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

const ERROR_MESSAGES: Record<string, string> = {
  // Validation errors
  VALIDATION_ERROR: 'Request validation failed',
  INVALID_REQUEST: 'Invalid request data',

  // Authentication & Authorization
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',

  // Resource errors
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',

  // Database errors
  DATABASE_ERROR: 'Database operation failed',

  // External service errors
  EXTERNAL_SERVICE_ERROR: 'External service unavailable',

  // Business logic errors
  BUSINESS_LOGIC_ERROR: 'Operation failed',
  MATERIAL_UPDATE_ERROR: 'Material update failed',
  ELEMENT_UPDATE_ERROR: 'Element update failed',
  ELEMENT_DELETE_ERROR: 'Element deletion failed',
  EC3_MATCH_ERROR: 'Material matching failed',

  // Upload errors
  UPLOAD_ERROR: 'File upload failed',
  PROCESSING_ERROR: 'File processing failed',

  // Generic errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  TIMEOUT_ERROR: 'Request timeout',
}

export function createApiErrorResponse(
  error: unknown,
  request?: Request,
  context?: { operation?: string; resource?: string }
): ApiErrorResponse {
  const timestamp = new Date().toISOString()
  const path = request?.url ? new URL(request.url).pathname : undefined
  const method = request?.method
  const requestId = generateRequestId()

  // Log the error for debugging
  logger.error('❌ [API Error Response] Error in createApiErrorResponse:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path,
    method,
    requestId,
    context,
  })

  if (isAppError(error)) {
    const userMessage = ERROR_MESSAGES[error.code || ''] || error.message

    return {
      success: false,
      error: userMessage,
      message: getContextualMessage(error, context),
      code: error.code,
      statusCode: error.statusCode,
      meta: {
        timestamp,
        path,
        method,
        requestId,
      },
    }
  }

  // Handle specific error types
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to external service',
      code: 'NETWORK_ERROR',
      statusCode: 502,
      meta: {
        timestamp,
        path,
        method,
        requestId,
      },
    }
  }

  if (error instanceof SyntaxError) {
    return {
      success: false,
      error: 'Data parsing error',
      message: 'Failed to parse request or response data',
      code: 'PARSE_ERROR',
      statusCode: 400,
      meta: {
        timestamp,
        path,
        method,
        requestId,
      },
    }
  }

  // Handle unknown errors
  return {
    success: false,
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    meta: {
      timestamp,
      path,
      method,
      requestId,
    },
  }
}

export function createApiSuccessResponse<T>(
  data: T,
  message: string,
  request?: Request
): ApiSuccessResponse<T> {
  const timestamp = new Date().toISOString()
  const path = request?.url ? new URL(request.url).pathname : undefined
  const method = request?.method
  const requestId = generateRequestId()

  return {
    success: true,
    data,
    message,
    meta: {
      timestamp,
      path,
      method,
      requestId,
    },
  }
}

export function sendApiErrorResponse(
  error: unknown,
  request?: Request,
  context?: { operation?: string; resource?: string }
): NextResponse<ApiErrorResponse> {
  const errorResponse = createApiErrorResponse(error, request, context)

  return NextResponse.json(errorResponse, {
    status: errorResponse.statusCode,
  })
}

export function sendApiSuccessResponse<T>(
  data: T,
  message: string,
  request?: Request,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const successResponse = createApiSuccessResponse(data, message, request)

  return NextResponse.json(successResponse, { status })
}

function getContextualMessage(
  error: AppError,
  context?: { operation?: string; resource?: string }
): string {
  const { operation, resource } = context || {}

  if (operation && resource) {
    return `Failed to ${operation} ${resource}`
  }

  if (operation) {
    return `Failed to ${operation}`
  }

  if (resource) {
    return `Failed to access ${resource}`
  }

  return error.message
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Specialized error formatters for common scenarios
export function formatValidationError(
  errors: Array<{
    field: string
    message: string
    code: string
  }>,
  field?: string
): ApiErrorResponse {
  return {
    success: false,
    error: 'Validation failed',
    message: field ? `Invalid ${field}` : 'Request validation failed',
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    details: errors,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
}

export function formatNotFoundError(resource: string, id?: string): ApiErrorResponse {
  return {
    success: false,
    error: 'Resource not found',
    message: id ? `${resource} with ID ${id} not found` : `${resource} not found`,
    code: 'NOT_FOUND',
    statusCode: 404,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
}

export function formatUploadError(error: unknown, request?: Request): ApiErrorResponse {
  const baseError = createApiErrorResponse(error, request, {
    operation: 'upload',
    resource: 'file',
  })

  // Add upload-specific error handling
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('ifc4x1') || message.includes('no schema named')) {
      return {
        ...baseError,
        error: 'IFC Schema Detected',
        message: 'Your IFC file uses the IFC4X1 schema which requires special processing.',
        code: 'IFC_SCHEMA_ERROR',
        statusCode: 400,
      }
    }

    if (message.includes('timeout')) {
      return {
        ...baseError,
        error: 'Upload Timeout',
        message: 'The upload timed out. Please try again with a smaller file.',
        code: 'UPLOAD_TIMEOUT',
        statusCode: 408,
      }
    }

    if (message.includes('no elements found')) {
      return {
        ...baseError,
        error: 'No Elements Found',
        message: 'No building elements found in the IFC file.',
        code: 'NO_ELEMENTS_FOUND',
        statusCode: 400,
      }
    }
  }

  return baseError
}
