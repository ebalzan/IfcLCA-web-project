import { Types } from 'mongoose'
import { z } from 'zod'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'

/**
 * Standard pagination request schema
 */
export const paginationRequestSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z.string().optional(),
  sortOrder: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({ message: 'Sort order must be either "asc" or "desc"' }),
    })
    .default('desc'),
})

/**
 * Standard search request schema
 */
export const searchRequestSchema = paginationRequestSchema.extend({
  query: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
})

/**
 * Standard ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
})

export const applyAutomaticMaterialMatchesRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  projectId: z.custom<Types.ObjectId>(),
})

export const createMaterialMatchRequestSchema = z.object({
  materialId: z.custom<Types.ObjectId>(),
  data: z.custom<
    Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId'>> & { score: number; ec3MatchId: string }
  >(),
})

export const createMaterialBulkMatchRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  data: z
    .array(createMaterialMatchRequestSchema.shape.data)
    .min(1, 'At least one update is required'),
})

export const updateMaterialRequestSchema = z.object({
  materialId: z.custom<Types.ObjectId>(),
  updates: z.custom<Partial<Omit<IMaterialDB, 'id'>>>(),
})

export const updateMultipleMaterialsRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  updates: z
    .array(updateMaterialRequestSchema.shape.updates)
    .min(1, 'At least one update is required'),
})

export const deleteMaterialRequestSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid material ID format'),
})

// Request types
export type PaginationRequest = z.infer<typeof paginationRequestSchema>
export type SearchRequest = z.infer<typeof searchRequestSchema>
export type IdParam = z.infer<typeof idParamSchema>

// Material types

// Create material types
export type CreateMaterialMatchRequest = z.infer<typeof createMaterialMatchRequestSchema>
export type CreateMaterialBulkMatchRequest = z.infer<typeof createMaterialBulkMatchRequestSchema>

// Update material types
export type UpdateMaterialRequest = z.infer<typeof updateMaterialRequestSchema>
export type UpdateMultipleMaterialsRequest = z.infer<typeof updateMultipleMaterialsRequestSchema>

// Delete material types
export type DeleteMaterialRequest = z.infer<typeof deleteMaterialRequestSchema>

// IFC processing types
export type ApplyAutomaticMaterialMatchesRequest = z.infer<
  typeof applyAutomaticMaterialMatchesRequestSchema
>
