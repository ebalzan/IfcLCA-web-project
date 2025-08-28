import { z } from 'zod'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { paginationResponseSchema } from '@/schemas/general'

// Create material types
export const createMaterialResponseSchema = z.custom<IMaterialDB>()
export const createMaterialBulkResponseSchema = z.array(z.custom<IMaterialDB>())

// Create EC3 match types
export const createEC3MatchResponseSchema = z.custom<IEC3Match | null>()
export const createEC3BulkMatchResponseSchema = z.array(z.custom<IEC3Match>())

// Get material types
export const getMaterialResponseSchema = z.custom<IMaterialDB>()
export const getMaterialBulkResponseSchema = z.object({
  materials: z.array(z.custom<IMaterialDB>()),
  pagination: paginationResponseSchema.optional(),
})
export const getMaterialBulkByProjectResponseSchema = z.object({
  materials: z.array(z.custom<IMaterialDB>()),
  pagination: paginationResponseSchema.optional(),
})

// Update material types
export const updateMaterialResponseSchema = z.custom<IMaterialDB>()
export const updateMaterialBulkResponseSchema = z.array(z.custom<IMaterialDB>())

// Delete material types
export const deleteMaterialResponseSchema = z.custom<IMaterialDB>()
export const deleteMaterialBulkResponseSchema = z.array(z.custom<IMaterialDB>())

// Create material types
export type CreateMaterialResponse = z.infer<typeof createMaterialResponseSchema>
export type CreateMaterialBulkResponse = z.infer<typeof createMaterialBulkResponseSchema>

// Create EC3 match types
export type CreateEC3MatchResponse = z.infer<typeof createEC3MatchResponseSchema>
export type CreateEC3BulkMatchResponse = z.infer<typeof createEC3BulkMatchResponseSchema>

// Get material types
export type GetMaterialResponse = z.infer<typeof getMaterialResponseSchema>
export type GetMaterialBulkResponse = z.infer<typeof getMaterialBulkResponseSchema>
export type GetMaterialBulkByProjectResponse = z.infer<
  typeof getMaterialBulkByProjectResponseSchema
>

// Update material types
export type UpdateMaterialResponse = z.infer<typeof updateMaterialResponseSchema>
export type UpdateMaterialBulkResponse = z.infer<typeof updateMaterialBulkResponseSchema>

// Delete material types
export type DeleteMaterialResponse = z.infer<typeof deleteMaterialResponseSchema>
export type DeleteMaterialBulkResponse = z.infer<typeof deleteMaterialBulkResponseSchema>
