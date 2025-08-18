import { z } from 'zod'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { defaultResponseSchema, paginationResponseSchema } from '../general'

export type EC3MatchData = Omit<IEC3Match, '_id' | 'materialId'> & { materialId: string }

// Create material types
export const createMaterialResponseSchema = defaultResponseSchema(
  z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>()
)
export const createMaterialBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>())
)

// Create EC3 match types
export const createEC3MatchResponseSchema = defaultResponseSchema(z.custom<EC3MatchData | null>())
export const createEC3BulkMatchResponseSchema = defaultResponseSchema(
  z.array(z.custom<EC3MatchData>())
)

// Get material types
export const getMaterialResponseSchema = defaultResponseSchema(
  z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>()
)
export const getMaterialBulkResponseSchema = defaultResponseSchema(
  z.object({
    materials: z.array(z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>()),
    pagination: paginationResponseSchema,
  })
)

// Update material types
export const updateMaterialResponseSchema = defaultResponseSchema(
  z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>()
)
export const updateMaterialBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>())
)

// Delete material types
export const deleteMaterialResponseSchema = defaultResponseSchema(
  z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>()
)
export const deleteMaterialBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IMaterialDB, '_id'> & { _id: string }>())
)

// Create material types
export type CreateMaterialResponse = z.infer<typeof createMaterialResponseSchema>
export type CreateMaterialBulkResponse = z.infer<typeof createMaterialBulkResponseSchema>

// Create EC3 match types
export type CreateEC3MatchResponse = z.infer<typeof createEC3MatchResponseSchema>
export type CreateEC3BulkMatchResponse = z.infer<typeof createEC3BulkMatchResponseSchema>

// Get material types
export type GetMaterialResponse = z.infer<typeof getMaterialResponseSchema>
export type GetMaterialBulkResponse = z.infer<typeof getMaterialBulkResponseSchema>

// Update material types
export type UpdateMaterialResponse = z.infer<typeof updateMaterialResponseSchema>
export type UpdateMaterialBulkResponse = z.infer<typeof updateMaterialBulkResponseSchema>

// Delete material types
export type DeleteMaterialResponse = z.infer<typeof deleteMaterialResponseSchema>
export type DeleteMaterialBulkResponse = z.infer<typeof deleteMaterialBulkResponseSchema>
