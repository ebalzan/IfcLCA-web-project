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
  request: NextRequest
): z.infer<T> => {
  const { searchParams } = new URL(request.url)
  const queryObject = Object.fromEntries(searchParams.entries())

  return schema.parse(queryObject)
}

export const validatePathParams = async <T extends z.ZodSchema>(
  schema: T,
  params: Promise<z.infer<T>>
): Promise<z.infer<T>> => {
  const data = await params
  return schema.parse(data)
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

export const withAuthAndValidationParams = <T, P, Q>(
  schema: z.ZodSchema<T>,
  handler: (
    request: AuthenticatedValidationRequest<T>,
    context: { pathParams: Promise<P>; queryParams: Promise<Q> }
  ) => Promise<NextResponse>
) => {
  return withAuthAndDBParams<P, Q>(async (authRequest, context) => {
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
