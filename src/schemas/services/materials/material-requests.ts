import { Types } from 'mongoose'
import { z } from 'zod'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { defaultRequestSchema, paginationRequestSchema } from '@/schemas/general'

// Create material
export const createMaterialRequestSchema = defaultRequestSchema(
  z.custom<Omit<IMaterialDB, '_id' | 'ec3MatchId'>>()
)
export const createMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materials: z.array(z.custom<Omit<IMaterialDB, '_id' | 'ec3MatchId'>>()),
    projectId: z.custom<Types.ObjectId>(),
  })
)

// Create EC3 match
export const createEC3MatchRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
    updates: z.custom<
      Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId'>> &
        Pick<IEC3Match, 'score' | 'ec3MatchId' | 'autoMatched'>
    >(),
  })
)
export const createEC3BulkMatchRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    updates: z
      .array(
        z.custom<
          Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId' | 'uploadId' | 'projectId'>> &
            Pick<IEC3Match, 'score' | 'ec3MatchId' | 'autoMatched'>
        >()
      )
      .min(1, 'At least one update is required'),
  })
)

// Get material
export const getMaterialRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
  })
)
export const getMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    pagination: paginationRequestSchema.optional(),
  })
)
export const getMaterialBulkByProjectRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    pagination: paginationRequestSchema.optional(),
  })
)

// Update material
export const updateMaterialRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
    updates: z.custom<Partial<Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'>>>(),
  })
)
export const updateMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    updates: z
      .array(z.custom<Partial<Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'>>>())
      .min(1, 'At least one update is required'),
  })
)

// Delete material
export const deleteMaterialRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
  })
)
export const deleteMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  })
)

// Create material types
export type CreateMaterialRequest = z.infer<typeof createMaterialRequestSchema>
export type CreateMaterialBulkRequest = z.infer<typeof createMaterialBulkRequestSchema>

// Create EC3 match types
export type CreateEC3MatchRequest = z.infer<typeof createEC3MatchRequestSchema>
export type CreateEC3BulkMatchRequest = z.infer<typeof createEC3BulkMatchRequestSchema>

// Get material types
export type GetMaterialRequest = z.infer<typeof getMaterialRequestSchema>
export type GetMaterialBulkRequest = z.infer<typeof getMaterialBulkRequestSchema>
export type GetMaterialBulkByProjectRequest = z.infer<typeof getMaterialBulkByProjectRequestSchema>

// Update material types
export type UpdateMaterialRequest = z.infer<typeof updateMaterialRequestSchema>
export type UpdateMaterialBulkRequest = z.infer<typeof updateMaterialBulkRequestSchema>

// Delete material types
export type DeleteMaterialRequest = z.infer<typeof deleteMaterialRequestSchema>
export type DeleteMaterialBulkRequest = z.infer<typeof deleteMaterialBulkRequestSchema>
