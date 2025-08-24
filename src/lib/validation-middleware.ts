import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { formatValidationError } from './api-error-response'
import { AuthenticatedRequest, withAuthAndDB, withAuthAndDBParams } from './api-middleware'

export interface ValidationRequest<T> extends NextRequest {
  validatedData: T
}

export interface AuthenticatedValidationRequest<T>
  extends AuthenticatedRequest,
    ValidationRequest<T> {}

export type ValidationMiddleware<T> = (
  schema: z.ZodSchema<T>,
  handler: (request: ValidationRequest<T>) => Promise<NextResponse>
) => (request: NextRequest) => Promise<NextResponse>

export type RequestProcessingMethod = 'json' | 'formData'

export interface ValidationOptions {
  method: RequestProcessingMethod
  strictHeaders?: boolean
}

const validateContentType = (
  request: NextRequest,
  expectedMethod: RequestProcessingMethod,
  strictHeaders: boolean = true
): boolean => {
  if (!strictHeaders) return true

  const contentType = request.headers.get('Content-Type')?.toLowerCase() || ''

  switch (expectedMethod) {
    case 'json':
      return contentType.includes('application/json')
    case 'formData':
      return contentType.includes('multipart/form-data')
    default:
      return true
  }
}

const parseRequestBody = async <T>(
  request: NextRequest,
  method: RequestProcessingMethod
): Promise<T> => {
  switch (method) {
    case 'json':
      return await request.json()
    case 'formData':
      const formData = await request.formData()
      const data: Record<string, unknown> = {}

      for (const [key, value] of formData.entries()) {
        if (key === 'data' && typeof value === 'string') {
          // Parse the data field as JSON
          try {
            const parsedData = JSON.parse(value)
            // Add the file from the separate 'file' field
            if (formData.get('file') instanceof File) {
              parsedData.file = formData.get('file')
            }
            data[key] = parsedData
          } catch {
            data[key] = value
          }
        } else if (key !== 'file') {
          // Skip the file field as it's handled above
          data[key] = value
        }
      }

      return data as T
    default:
      return await request.json()
  }
}

export const withValidation = <T>(
  schema: z.ZodSchema<T>,
  handler: (request: ValidationRequest<T>) => Promise<NextResponse>,
  options: ValidationOptions
) => {
  const { method, strictHeaders = true } = options

  return async (request: NextRequest) => {
    try {
      if (!validateContentType(request, method, strictHeaders)) {
        const expectedContentType = method === 'json' ? 'application/json' : 'multipart/form-data'

        const errorResponse = formatValidationError(
          [],
          `Invalid Content-Type. Expected: ${expectedContentType}`
        )
        return NextResponse.json(errorResponse, { status: 400 })
      }

      const body: T = await parseRequestBody<T>(request, method)
      const validatedData = schema.parse(body)

      const validationRequest = request as ValidationRequest<T>
      validationRequest.validatedData = validatedData

      return await handler(validationRequest)
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }))

        const errorResponse = formatValidationError(formattedErrors)
        return NextResponse.json(errorResponse, { status: 400 })
      }

      const errorResponse = formatValidationError([], 'request body')
      return NextResponse.json(errorResponse, { status: 400 })
    }
  }
}

// Deep merge utility function
const deepMerge = (target: any, source: any): any => {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

// Map flat query parameters to nested structure based on common patterns
const mapQueryParamsToNested = (searchParams: URLSearchParams): any => {
  const result: any = {}

  for (const [key, value] of searchParams) {
    // Handle pagination parameters
    if (key === 'page' || key === 'size') {
      if (!result.data) result.data = {}
      if (!result.data.pagination) result.data.pagination = {}
      result.data.pagination[key] = parseInt(value, 10)
    } else {
      // All other parameters go into data
      if (!result.data) result.data = {}
      result.data[key] = value
    }
  }

  return result
}

export const validateQueryParams = <T extends z.ZodSchema>(
  schema: T,
  request: NextRequest,
  defaults?: Partial<z.infer<T>>
): z.infer<T> => {
  const searchParams = request.nextUrl.searchParams

  const queryObject = mapQueryParamsToNested(searchParams)

  const dataToValidate = defaults ? deepMerge(defaults, queryObject) : queryObject
  return schema.parse(dataToValidate)
}

export const validatePathParams = async <T extends z.ZodSchema>(
  schema: T,
  params: Promise<z.infer<T>>,
  defaults?: Partial<z.infer<T>>
): Promise<z.infer<T>> => {
  const pathParams = await params
  const dataToValidate = defaults ? { ...defaults, ...pathParams } : pathParams
  return schema.parse(dataToValidate)
}

export const withAuthAndValidation = <T>(
  schema: z.ZodSchema<T>,
  handler: (request: AuthenticatedValidationRequest<T>) => Promise<NextResponse>,
  options: ValidationOptions
) => {
  return withAuthAndDB(async authRequest => {
    const validationHandler = withValidation<T>(
      schema,
      validationRequest => {
        const mergedRequest = {
          ...authRequest,
          ...validationRequest,
        } as AuthenticatedValidationRequest<T>

        return handler(mergedRequest)
      },
      {
        ...options,
      }
    )

    return validationHandler(authRequest)
  })
}

export const withAuthAndValidationWithParams = <T, P>(
  schema: z.ZodSchema<T>,
  handler: (
    request: AuthenticatedValidationRequest<T>,
    context: { params: Promise<P> }
  ) => Promise<NextResponse>,
  options: ValidationOptions
) => {
  return withAuthAndDBParams<P>(async (authRequest, context) => {
    const validationHandler = withValidation<T>(
      schema,
      validationRequest => {
        const mergedRequest = {
          ...authRequest,
          ...validationRequest,
        } as AuthenticatedValidationRequest<T>

        return handler(mergedRequest, context)
      },
      {
        ...options,
      }
    )

    return validationHandler(authRequest)
  })
}
