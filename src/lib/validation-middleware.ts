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

export const withValidation = <T>(
  schema: z.ZodSchema<T>,
  handler: (request: ValidationRequest<T>) => Promise<NextResponse>
) => {
  return async (request: NextRequest) => {
    try {
      const body: T = await request.json()
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

export const validateQueryParams = <T extends z.ZodSchema>(
  schema: T,
  request: NextRequest,
  defaults?: Partial<z.infer<T>>
): z.infer<T> => {
  const { searchParams } = new URL(request.url)

  // Convert string values to appropriate types based on schema
  const queryObject: Record<string, string | number> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle numeric values
    if (key === 'page' || key === 'size' || key === 'limit') {
      queryObject[key] = parseInt(value, 10)
    } else {
      queryObject[key] = value
    }
  }

  const dataToValidate = defaults ? { ...defaults, ...queryObject } : queryObject
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

export const validateFileUpload = async <T extends z.ZodSchema>(
  schema: T,
  request: NextRequest
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: NextResponse }> => {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      return {
        success: false,
        error: NextResponse.json(
          { error: 'File validation failed', details: formattedErrors },
          { status: 400 }
        ),
      }
    }
    return {
      success: false,
      error: NextResponse.json({ error: 'Invalid file upload' }, { status: 400 }),
    }
  }
}

export const withAuthAndValidation = <T>(
  schema: z.ZodSchema<T>,
  handler: (request: AuthenticatedValidationRequest<T>) => Promise<NextResponse>
) => {
  return withAuthAndDB(async authRequest => {
    const validationHandler = withValidation<T>(schema, validationRequest => {
      const mergedRequest = {
        ...authRequest,
        ...validationRequest,
      } as AuthenticatedValidationRequest<T>

      return handler(mergedRequest)
    })

    return validationHandler(authRequest)
  })
}

export const withAuthAndValidationWithParams = <T, P>(
  schema: z.ZodSchema<T>,
  handler: (
    request: AuthenticatedValidationRequest<T>,
    context: { params: Promise<P> }
  ) => Promise<NextResponse>
) => {
  return withAuthAndDBParams<P>(async (authRequest, context) => {
    const validationHandler = withValidation<T>(schema, validationRequest => {
      const mergedRequest = {
        ...authRequest,
        ...validationRequest,
      } as AuthenticatedValidationRequest<T>

      return handler(mergedRequest, context)
    })

    return validationHandler(authRequest)
  })
}
