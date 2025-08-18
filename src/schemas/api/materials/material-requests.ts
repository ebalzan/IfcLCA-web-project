import { Types } from 'mongoose'
import { z } from 'zod'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { defaultRequestSchema, paginationRequestSchema } from '../general'

// Create material
export const createMaterialRequestSchema = defaultRequestSchema(
  z.custom<Omit<IMaterialDB, '_id' | 'ec3MatchId'>>()
)
export const createMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materials: z.array(z.custom<Omit<IMaterialDB, '_id' | 'ec3MatchId'>>()),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Create EC3 match
export const createEC3MatchRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
    updates: z.custom<
      Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId'>> & { score: number; ec3MatchId: string }
    >(),
  })
)
export const createEC3BulkMatchRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    updates: z
      .array(
        z.custom<
          Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId'>> & { score: number; ec3MatchId: string }
        >()
      )
      .min(1, 'At least one update is required'),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Get material
export const getMaterialRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const getMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    materialNames: z.array(z.string()).min(1, 'At least one material name is required').optional(),
    projectId: z.custom<Types.ObjectId>().optional(),
    pagination: paginationRequestSchema,
  })
)

// Update material
export const updateMaterialRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
    updates: z.custom<Partial<Omit<IMaterialDB, 'id'>>>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const updateMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    updates: z
      .array(z.custom<Partial<Omit<IMaterialDB, 'id'>>>())
      .min(1, 'At least one update is required'),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Delete material
export const deleteMaterialRequestSchema = defaultRequestSchema(
  z.object({
    materialId: z.custom<Types.ObjectId>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const deleteMaterialBulkRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    projectId: z.custom<Types.ObjectId>().optional(),
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

// Update material types
export type UpdateMaterialRequest = z.infer<typeof updateMaterialRequestSchema>
export type UpdateMaterialBulkRequest = z.infer<typeof updateMaterialBulkRequestSchema>

// Delete material types
export type DeleteMaterialRequest = z.infer<typeof deleteMaterialRequestSchema>
export type DeleteMaterialBulkRequest = z.infer<typeof deleteMaterialBulkRequestSchema>
