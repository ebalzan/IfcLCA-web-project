import { Types } from 'mongoose'
import { z } from 'zod'
import { DefaultRequest } from '@/interfaces/DefaultRequest'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'

// Create material
export const createMaterialRequestSchema = z.custom<Omit<IMaterialDB, 'id' | 'ec3MatchId'>>()
export const createMaterialBulkRequestSchema = z.object({
  materials: z.array(createMaterialRequestSchema),
})

// Create EC3 match
export const createEC3MatchRequestSchema = z.object({
  materialId: z.custom<Types.ObjectId>(),
  updates: z.custom<
    Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId'>> & { score: number; ec3MatchId: string }
  >(),
})
export const createEC3BulkMatchRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  updates: z
    .array(createEC3MatchRequestSchema.shape.updates)
    .min(1, 'At least one update is required'),
})

// Get material
export const getMaterialRequestSchema = z.object({
  materialId: z.custom<Types.ObjectId>(),
  ec3MatchId: z.string().optional(),
})
export const getMaterialBulkRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
})

// Update material
export const updateMaterialRequestSchema = z.object({
  materialId: z.custom<Types.ObjectId>(),
  updates: z.custom<Partial<Omit<IMaterialDB, 'id'>>>(),
})
export const updateMaterialBulkRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  updates: z
    .array(updateMaterialRequestSchema.shape.updates)
    .min(1, 'At least one update is required'),
})

// Delete material
export const deleteMaterialRequestSchema = z.object({
  materialId: z.custom<Types.ObjectId>(),
})

// Create material types
export type CreateMaterialRequest = DefaultRequest<z.infer<typeof createMaterialRequestSchema>>
export type CreateMaterialBulkRequest = DefaultRequest<
  z.infer<typeof createMaterialBulkRequestSchema>
>

// Create EC3 match types
export type CreateEC3MatchRequest = DefaultRequest<z.infer<typeof createEC3MatchRequestSchema>>
export type CreateEC3BulkMatchRequest = DefaultRequest<
  z.infer<typeof createEC3BulkMatchRequestSchema>
>

// Get material types
export type GetMaterialRequest = DefaultRequest<z.infer<typeof getMaterialRequestSchema>>
export type GetMaterialBulkRequest = DefaultRequest<z.infer<typeof getMaterialBulkRequestSchema>>

// Update material types
export type UpdateMaterialRequest = DefaultRequest<z.infer<typeof updateMaterialRequestSchema>>
export type UpdateMaterialBulkRequest = DefaultRequest<
  z.infer<typeof updateMaterialBulkRequestSchema>
>

// Delete material types
export type DeleteMaterialRequest = DefaultRequest<z.infer<typeof deleteMaterialRequestSchema>>
