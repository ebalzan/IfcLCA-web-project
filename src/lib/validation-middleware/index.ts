import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  ValidationRequest,
  AuthenticatedValidationRequest,
  RequestProcessingMethod,
  ValidationContext,
  WithValidation,
  WithAuthAndValidation,
  WithAuthAndValidationWithQueryParams,
  WithAuthAndValidationWithPathParams,
  WithAuthAndValidationWithPathAndQueryParams,
  WithAuthAndPathParams,
  WithAuthAndQueryParams,
  WithAuthAndPathAndQueryParams,
} from './types'
import { formatValidationError, sendApiErrorResponse } from '../api-error-response'
import { withAuthAndDB, withAuthAndDBWithPathParams } from '../api-middleware'

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

// Deep merge utility function
const deepMerge = <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
  const result = { ...target } as T

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>]
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>]
    }
  }

  return result
}

// Map flat query parameters to nested structure based on common patterns
const mapQueryParamsToNested = <T>(searchParams: URLSearchParams) => {
  const result: Record<string, unknown> = {}
  const pagination = { page: 1, size: 50 }

  for (const [key, value] of searchParams) {
    if (key === 'page' || key === 'size') {
      pagination[key as keyof typeof pagination] = parseInt(value, 10)
    } else {
      // Put other parameters directly in the result (not nested under 'query')
      result[key] = value
    }
  }

  return {
    ...result,
    pagination,
  }
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
  try {
    const pathParams = await params
    const dataToValidate = defaults ? { ...defaults, ...pathParams } : pathParams

    return schema.parse(dataToValidate)
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: `path.${err.path.join('.')}`,
        message: err.message,
        code: err.code,
      }))
      throw new Error(`Path validation failed: ${JSON.stringify(formattedErrors)}`)
    }
    throw error
  }
}

export const withValidation = <DATA>({ dataSchema, handler, options }: WithValidation<DATA>) => {
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

      const body: DATA = await parseRequestBody<DATA>(request, method)
      const validatedData = dataSchema.parse(body)

      const validationRequest = request as ValidationRequest<DATA>
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

export const withAuthAndDBPathParams = <PATH_PARAMS>({
  pathParamsSchema,
  handler,
}: WithAuthAndPathParams<PATH_PARAMS>) => {
  return withAuthAndDBWithPathParams<PATH_PARAMS>(async (authRequest, context) => {
    const validatedPathParams = await validatePathParams(pathParamsSchema, context.params)

    return handler(authRequest, {
      params: Promise.resolve(validatedPathParams),
      query: {} as never,
    })
  })
}

export const withAuthAndDBQueryParams = <QUERY_PARAMS>({
  queryParamsSchema,
  handler,
}: WithAuthAndQueryParams<QUERY_PARAMS>) => {
  return withAuthAndDB(async authRequest => {
    const validatedQueryParams = validateQueryParams(queryParamsSchema, authRequest)

    return handler(authRequest, {
      params: Promise.resolve({} as never),
      query: validatedQueryParams,
    })
  })
}

export const withAuthAndDBPathAndQueryParams = <PATH_PARAMS, QUERY_PARAMS>({
  pathParamsSchema,
  queryParamsSchema,
  handler,
}: WithAuthAndPathAndQueryParams<PATH_PARAMS, QUERY_PARAMS>) => {
  return withAuthAndDBWithPathParams<PATH_PARAMS>(async (authRequest, context) => {
    const validatedPathParams = await validatePathParams(pathParamsSchema, context.params)
    const validatedQueryParams = validateQueryParams(queryParamsSchema, authRequest)

    return handler(authRequest, {
      params: Promise.resolve(validatedPathParams),
      query: validatedQueryParams,
    })
  })
}

export const withAuthAndDBValidation = <DATA>({
  dataSchema,
  handler,
  options,
}: WithAuthAndValidation<DATA>) => {
  return withAuthAndDB(async authRequest => {
    const validationHandler = withValidation<DATA>({
      dataSchema,
      handler: validationRequest => {
        const mergedRequest = {
          ...authRequest,
          ...validationRequest,
        } as AuthenticatedValidationRequest<DATA>

        return handler(mergedRequest)
      },
      options,
    })

    return validationHandler(authRequest)
  })
}

export const withAuthAndDBValidationWithPathParams = <DATA, PATH_PARAMS>({
  dataSchema,
  pathParamsSchema,
  handler,
  options,
}: WithAuthAndValidationWithPathParams<DATA, PATH_PARAMS>) => {
  return withAuthAndDBWithPathParams<PATH_PARAMS>(async (authRequest, context) => {
    try {
      const validationHandler = withValidation<DATA>({
        dataSchema,
        handler: async validationRequest => {
          const mergedRequest = {
            ...authRequest,
            ...validationRequest,
          } as AuthenticatedValidationRequest<DATA>

          return handler(mergedRequest, context)
        },
        options,
      })

      return validationHandler(authRequest)
    } catch (error: unknown) {
      return sendApiErrorResponse(error, authRequest, { operation: 'middleware' })
    }
  })
}

export const withAuthAndDBValidationWithQueryParams = <DATA, QUERY_PARAMS>({
  dataSchema,
  queryParamsSchema,
  handler,
  options,
}: WithAuthAndValidationWithQueryParams<DATA, QUERY_PARAMS>) => {
  return withAuthAndDBQueryParams<QUERY_PARAMS>({
    queryParamsSchema,
    handler: async (authRequest, context) => {
      try {
        const validationHandler = withValidation<DATA>({
          dataSchema,
          handler: async validationRequest => {
            const mergedRequest = {
              ...authRequest,
              ...validationRequest,
            } as AuthenticatedValidationRequest<DATA>

            return handler(mergedRequest, context)
          },
          options,
        })

        return validationHandler(authRequest)
      } catch (error: unknown) {
        return sendApiErrorResponse(error, authRequest, { operation: 'middleware' })
      }
    },
  })
}

export const withAuthAndDBValidationWithPathAndQueryParams = <DATA, PATH_PARAMS, QUERY_PARAMS>({
  dataSchema,
  pathParamsSchema,
  queryParamsSchema,
  handler,
  options,
}: WithAuthAndValidationWithPathAndQueryParams<DATA, PATH_PARAMS, QUERY_PARAMS>) => {
  return withAuthAndDBWithPathParams<PATH_PARAMS>(async (authRequest, context) => {
    try {
      const validatedPathParams = await validatePathParams(pathParamsSchema, context.params)
      const validatedQueryParams = validateQueryParams(queryParamsSchema, authRequest)

      const validationHandler = withValidation<DATA>({
        dataSchema,
        handler: async validationRequest => {
          const mergedRequest = {
            ...authRequest,
            ...validationRequest,
          } as AuthenticatedValidationRequest<DATA>

          const validationContext: ValidationContext<PATH_PARAMS, QUERY_PARAMS> = {
            params: Promise.resolve(validatedPathParams),
            query: validatedQueryParams,
          }

          return handler(mergedRequest, validationContext)
        },
        options,
      })

      return validationHandler(authRequest)
    } catch (error: unknown) {
      return sendApiErrorResponse(error, authRequest, { operation: 'middleware' })
    }
  })
}
