import { Types } from 'mongoose'
import { z } from 'zod'
import { IElementDB } from '@/interfaces/elements/IElementDB'
import { defaultRequestSchema, paginationRequestSchema } from '../../general'

// Create element
export const createElementRequestSchema = defaultRequestSchema(z.custom<Omit<IElementDB, '_id'>>())
export const createElementBulkRequestSchema = defaultRequestSchema(
  z.object({
    elements: z.array(createElementRequestSchema.shape.data),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

export const getElementRequestSchema = defaultRequestSchema(
  z.object({
    elementId: z.custom<Types.ObjectId>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

export const getElementBulkRequestSchema = defaultRequestSchema(
  z.object({
    elementIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one element ID is required'),
    projectId: z.custom<Types.ObjectId>().optional(),
    pagination: paginationRequestSchema,
  })
)

// Update element
export const updateElementRequestSchema = defaultRequestSchema(
  z.object({
    elementId: z.custom<Types.ObjectId>(),
    updates: z.custom<Partial<Omit<IElementDB, 'id'>>>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const updateElementBulkRequestSchema = defaultRequestSchema(
  z.object({
    elementIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one element ID is required'),
    updates: z
      .array(z.custom<Partial<Omit<IElementDB, 'id'>>>())
      .min(1, 'At least one update is required'),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Delete element
export const deleteElementRequestSchema = defaultRequestSchema(
  z.object({
    elementId: z.custom<Types.ObjectId>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

export const deleteElementBulkRequestSchema = defaultRequestSchema(
  z.object({
    elementIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one element ID is required'),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Create element types
export type CreateElementRequest = z.infer<typeof createElementRequestSchema>
export type CreateElementBulkRequest = z.infer<typeof createElementBulkRequestSchema>

// Get element types
export type GetElementRequest = z.infer<typeof getElementRequestSchema>
export type GetElementBulkRequest = z.infer<typeof getElementBulkRequestSchema>

// Update element types
export type UpdateElementRequest = z.infer<typeof updateElementRequestSchema>
export type UpdateElementBulkRequest = z.infer<typeof updateElementBulkRequestSchema>

// Delete element types
export type DeleteElementRequest = z.infer<typeof deleteElementRequestSchema>
export type DeleteElementBulkRequest = z.infer<typeof deleteElementBulkRequestSchema>
