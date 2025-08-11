/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`

    super(message, 404, 'NOT_FOUND')
  }
}

/**
 * Unauthorized access error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

/**
 * Forbidden access error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  public readonly field?: string

  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.field = field
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation?: string) {
    const fullMessage = operation
      ? `Database ${operation} failed: ${message}`
      : `Database operation failed: ${message}`

    super(fullMessage, 500, 'DATABASE_ERROR')
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  public readonly service: string

  constructor(service: string, message: string) {
    super(`External service ${service} error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR')
    this.service = service
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'BUSINESS_LOGIC_ERROR')
  }
}

/**
 * Project-specific errors
 */
export class ProjectNotFoundError extends NotFoundError {
  constructor(projectId?: string) {
    super('Project', projectId)
  }
}

export class ProjectAccessError extends ForbiddenError {
  constructor(message: string = 'You do not have access to this project') {
    super(message)
  }
}

/**
 * Project update error
 */
export class ProjectUpdateError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'PROJECT_UPDATE_ERROR')
  }
}

/**
 * Project delete error
 */
export class ProjectDeleteError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'PROJECT_DELETE_ERROR')
  }
}

/**
 * Project create error
 */
export class ProjectCreateError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'PROJECT_CREATE_ERROR')
  }
}

/**
 * Material-specific errors
 */
export class MaterialNotFoundError extends NotFoundError {
  constructor(materialId?: string) {
    super('Material', materialId)
  }
}

/**
 * Material update error
 */
export class MaterialUpdateError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'MATERIAL_UPDATE_ERROR')
  }
}

/**
 * Material create error
 */
export class MaterialCreateError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'MATERIAL_CREATE_ERROR')
  }
}

/**
 * Material delete error
 */
export class MaterialDeleteError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'MATERIAL_DELETE_ERROR')
  }
}

/**
 * Element not found error
 */
export class ElementNotFoundError extends NotFoundError {
  constructor(elementId?: string) {
    super('Element', elementId)
  }
}

/**
 * Element update error
 */
export class ElementUpdateError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'ELEMENT_UPDATE_ERROR')
  }
}

/**
 * Element create error
 */
export class ElementCreateError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'ELEMENT_CREATE_ERROR')
  }
}

/**
 * Element delete error
 */
export class ElementDeleteError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'ELEMENT_DELETE_ERROR')
  }
}

/**
 * EC3-specific errors
 */
export class EC3MatchError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'EC3_MATCH_ERROR')
  }
}

/**
 * EC3 create match error
 */
export class EC3CreateMatchError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'EC3_CREATE_MATCH_ERROR')
  }
}

/**
 * Upload-specific errors
 */
export class UploadError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'UPLOAD_ERROR')
  }
}

/**
 * Processing error
 */
export class ProcessingError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'PROCESSING_ERROR')
  }
}

/**
 * Error utility functions
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError
}

export const isOperationalError = (error: unknown): boolean => {
  return isAppError(error) && error.isOperational
}

export const getErrorResponse = (error: unknown) => {
  if (isAppError(error)) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  // For unknown errors, return generic response
  return {
    error: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  }
}
