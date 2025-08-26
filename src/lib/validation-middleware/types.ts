import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticatedRequest } from '../api-middleware'

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

export interface ValidationContext<PATH_PARAMS = never, QUERY_PARAMS = never> {
  params: Promise<PATH_PARAMS>
  query: QUERY_PARAMS
}

export interface WithValidation<DATA> {
  dataSchema: z.ZodSchema<DATA>
  handler: (request: ValidationRequest<DATA>) => Promise<NextResponse>
  options: ValidationOptions
}

export interface WithAuthAndPathParams<PATH_PARAMS> {
  pathParamsSchema: z.ZodSchema<PATH_PARAMS>
  handler: (
    request: AuthenticatedRequest,
    context: ValidationContext<PATH_PARAMS, never>
  ) => Promise<NextResponse>
}

export interface WithAuthAndQueryParams<QUERY_PARAMS> {
  queryParamsSchema: z.ZodSchema<QUERY_PARAMS>
  handler: (
    request: AuthenticatedRequest,
    context: ValidationContext<never, QUERY_PARAMS>
  ) => Promise<NextResponse>
}

export interface WithAuthAndValidation<DATA> {
  dataSchema: z.ZodSchema<DATA>
  handler: (request: AuthenticatedValidationRequest<DATA>) => Promise<NextResponse>
  options: ValidationOptions
}

export interface WithAuthAndValidationWithPathParams<DATA, PATH_PARAMS> {
  dataSchema: z.ZodSchema<DATA>
  pathParamsSchema: z.ZodSchema<PATH_PARAMS>
  handler: (
    request: AuthenticatedValidationRequest<DATA>,
    context: ValidationContext<PATH_PARAMS, never>
  ) => Promise<NextResponse>
  options: ValidationOptions
}

export interface WithAuthAndValidationWithQueryParams<DATA, QUERY_PARAMS> {
  dataSchema: z.ZodSchema<DATA>
  queryParamsSchema: z.ZodSchema<QUERY_PARAMS>
  handler: (
    request: AuthenticatedValidationRequest<DATA>,
    context: ValidationContext<never, QUERY_PARAMS>
  ) => Promise<NextResponse>
  options: ValidationOptions
}

export interface WithAuthAndValidationWithPathAndQueryParams<DATA, PATH_PARAMS, QUERY_PARAMS> {
  dataSchema: z.ZodSchema<DATA>
  pathParamsSchema: z.ZodSchema<PATH_PARAMS>
  queryParamsSchema: z.ZodSchema<QUERY_PARAMS>
  handler: (
    request: AuthenticatedValidationRequest<DATA>,
    context: ValidationContext<PATH_PARAMS, QUERY_PARAMS>
  ) => Promise<NextResponse>
  options: ValidationOptions
}
