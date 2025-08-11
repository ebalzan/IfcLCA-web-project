import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const validateFileUpload = async (request: NextRequest, schema: z.ZodSchema) => {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())

    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'File validation failed',
            details: formattedErrors,
            message: 'File upload validation failed',
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid file upload',
          message: 'Failed to process file upload',
        },
        { status: 400 }
      ),
    }
  }
}

export const validateQueryWithDefaults = <T extends z.ZodSchema>(
  schema: T,
  request: NextRequest,
  defaults: Record<string, any> = {}
) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryObject = Object.fromEntries(searchParams.entries())

    const queryWithDefaults = { ...defaults, ...queryObject }

    return { success: true, data: schema.parse(queryWithDefaults) }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Query parameter validation failed',
            details: formattedErrors,
            message: 'Invalid query parameters',
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid query parameters',
          message: 'Failed to parse query parameters',
        },
        { status: 400 }
      ),
    }
  }
}

export const validatePathWithDefaults = async <T extends z.ZodSchema>(
  schema: T,
  params: Promise<{ [key: string]: string }>,
  defaults: Record<string, any> = {}
) => {
  try {
    const pathParams = await params
    const paramsWithDefaults = { ...defaults, ...pathParams }

    return { success: true, data: schema.parse(paramsWithDefaults) }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Path parameter validation failed',
            details: formattedErrors,
            message: 'Invalid path parameters',
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid path parameters',
          message: 'Failed to parse path parameters',
        },
        { status: 400 }
      ),
    }
  }
}
