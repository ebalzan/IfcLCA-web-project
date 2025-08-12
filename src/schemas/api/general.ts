import { ClientSession } from 'mongoose'
import { z } from 'zod'

// ID param
export const idParamSchema = z.object({
  id: z.string().min(1),
})

// Pagination
export const paginationRequestSchema = z.object({
  size: z.number().min(1).max(50),
  page: z.number().min(1),
})
export const paginationResponseSchema = z.object({
  size: z.number().min(1).max(50),
  page: z.number().min(1),
  hasMore: z.boolean(),
  totalCount: z.number(),
  totalPages: z.number(),
})

// Default request schema
export const defaultRequestSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    data: schema,
    session: z.custom<ClientSession>().optional(),
  })

// Default response schema
export const defaultResponseSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: schema,
  })

// ID param
export type IdParamSchema = z.infer<typeof idParamSchema>

// Pagination
export type PaginationRequest = z.infer<typeof paginationRequestSchema>
export type PaginationResponse = z.infer<typeof paginationResponseSchema>
