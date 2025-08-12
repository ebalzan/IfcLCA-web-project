import { z } from 'zod'
import { IElementDB } from '@/interfaces/elements/IElementDB'
import { defaultResponseSchema, paginationResponseSchema } from '../general'

// Create element types
export const createElementResponseSchema = defaultResponseSchema(z.custom<IElementDB>())
export const createElementBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IElementDB>())
)

// Get element types
export const getElementResponseSchema = defaultResponseSchema(z.custom<IElementDB>())
export const getElementBulkResponseSchema = defaultResponseSchema(
  z.object({
    elements: z.array(z.custom<IElementDB>()),
    pagination: paginationResponseSchema,
  })
)

// Update element types
export const updateElementResponseSchema = defaultResponseSchema(z.custom<IElementDB>())
export const updateElementBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IElementDB>())
)

// Delete element types
export const deleteElementResponseSchema = defaultResponseSchema(z.custom<IElementDB>())
export const deleteElementBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IElementDB>())
)

// Create element types
export type CreateElementResponse = z.infer<typeof createElementResponseSchema>
export type CreateElementBulkResponse = z.infer<typeof createElementBulkResponseSchema>

// Get element types
export type GetElementResponse = z.infer<typeof getElementResponseSchema>
export type GetElementBulkResponse = z.infer<typeof getElementBulkResponseSchema>

// Update element types
export type UpdateElementResponse = z.infer<typeof updateElementResponseSchema>
export type UpdateElementBulkResponse = z.infer<typeof updateElementBulkResponseSchema>

// Delete element types
export type DeleteElementResponse = z.infer<typeof deleteElementResponseSchema>
export type DeleteElementBulkResponse = z.infer<typeof deleteElementBulkResponseSchema>
