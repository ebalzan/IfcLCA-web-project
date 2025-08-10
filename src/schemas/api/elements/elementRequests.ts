import { Types } from 'mongoose'
import { z } from 'zod'
import { DefaultRequest } from '@/interfaces/DefaultRequest'
import { IElementDB } from '@/interfaces/elements/IElementDB'

// Create element
export const createElementRequestSchema = z.custom<Omit<IElementDB, 'id'>>()
export const createElementBulkRequestSchema = z.object({
  elements: z.array(createElementRequestSchema),
})

// Update element
export const updateElementRequestSchema = z.object({
  elementId: z.custom<Types.ObjectId>(),
  updates: z.custom<Partial<Omit<IElementDB, 'id'>>>(),
})
export const updateElementBulkRequestSchema = z.object({
  elementIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one element ID is required'),
  updates: z
    .array(updateElementRequestSchema.shape.updates)
    .min(1, 'At least one update is required'),
})

// Delete element
export const deleteElementRequestSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid element ID format'),
})

// Create element types
export type CreateElementRequest = DefaultRequest<z.infer<typeof createElementRequestSchema>>
export type CreateElementBulkRequest = DefaultRequest<
  z.infer<typeof createElementBulkRequestSchema>
>

// Update element types
export type UpdateElementRequest = DefaultRequest<z.infer<typeof updateElementRequestSchema>>
export type UpdateElementBulkRequest = DefaultRequest<
  z.infer<typeof updateElementBulkRequestSchema>
>

// Delete element types
export type DeleteElementRequest = DefaultRequest<z.infer<typeof deleteElementRequestSchema>>
