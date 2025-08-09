import { z } from 'zod'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'

/**
 * Material Response Schemas
 */
export const materialResponseSchema = z.custom<IMaterialDB>()

export const ec3MatchResponseSchema = z.custom<
  Omit<IEC3Match, '_id' | 'materialId'> & { materialId: string }
>()

export const applyAutomaticMaterialMatchesResponseSchema = z.object({
  matchedCount: z.number(),
})

export const deleteMaterialResponseSchema = z.object({
  id: z.string(),
  message: z.string(),
})

export const updateMaterialResponseSchema = z.object({
  data: materialResponseSchema,
  message: z.string(),
})

export const updateMultipleMaterialsResponseSchema = z.object({
  materialsAffected: z.number(),
  data: z.array(materialResponseSchema),
  message: z.string(),
})

export const createMaterialMatchResponseSchema = z.object({
  data: ec3MatchResponseSchema.nullable(),
  message: z.string(),
})

export const createMaterialBulkMatchResponseSchema = z.object({
  materialsAffected: z.number(),
  data: z.array(ec3MatchResponseSchema),
  message: z.string(),
})

/**
 * Generic Response Schemas
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  meta: z
    .object({
      timestamp: z.date(),
      requestId: z.string().optional(),
    })
    .optional(),
})

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  meta: z
    .object({
      timestamp: z.date(),
      requestId: z.string().optional(),
    })
    .optional(),
})

// TypeScript types
export type UpdateMaterialResponse = z.infer<typeof updateMaterialResponseSchema>
export type UpdateMultipleMaterialsResponse = z.infer<typeof updateMultipleMaterialsResponseSchema>

export type DeleteMaterialResponse = z.infer<typeof deleteMaterialResponseSchema>
export type CreateMaterialMatchResponse = z.infer<typeof createMaterialMatchResponseSchema>
export type CreateMaterialBulkMatchResponse = z.infer<typeof createMaterialBulkMatchResponseSchema>

export type SuccessResponse<T> = z.infer<typeof successResponseSchema> & { data: T }
export type ErrorResponse = z.infer<typeof errorResponseSchema>

// IFC processing types
export type ApplyAutomaticMaterialMatchesResponse = z.infer<
  typeof applyAutomaticMaterialMatchesResponseSchema
>
