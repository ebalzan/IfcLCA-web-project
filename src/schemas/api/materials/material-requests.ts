import { z } from 'zod'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { defaultRequestSchema, paginationRequestSchema } from '@/schemas/general'

// Create material
export const createMaterialRequestApiSchema = defaultRequestSchema(
  z.custom<
    Omit<IMaterialDB, '_id' | 'ec3MatchId' | 'projectId' | 'uploadId'> & {
      projectId: string
      uploadId: string
    }
  >()
)
export const createMaterialBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    materials: z.array(
      z.custom<
        Omit<IMaterialDB, '_id' | 'ec3MatchId' | 'projectId' | 'uploadId'> & {
          projectId: string
          uploadId: string
        }
      >()
    ),
    projectId: z.string(),
  })
)

// Create EC3 match
export const createEC3MatchRequestApiSchema = defaultRequestSchema(
  z.object({
    materialId: z.string(),
    updates: z.custom<
      Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId' | 'projectId' | 'uploadId'>> & {
        score: number
        ec3MatchId: string
        projectId: string
        uploadId: string
      }
    >(),
  })
)
export const createEC3BulkMatchRequestApiSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
    updates: z
      .array(
        z.custom<
          Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId' | 'projectId' | 'uploadId'>> & {
            score: number
            ec3MatchId: string
            projectId: string
            uploadId: string
          }
        >()
      )
      .min(1, 'At least one update is required'),
    projectId: z.string(),
  })
)

// Get material
export const getMaterialRequestApiSchema = defaultRequestSchema(
  z.object({
    materialId: z.string(),
    projectId: z.string(),
  })
)
export const getMaterialBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    projectId: z.string().optional(),
    pagination: paginationRequestSchema,
  })
)

// Update material
export const updateMaterialRequestApiSchema = defaultRequestSchema(
  z.object({
    materialId: z.string(),
    updates: z.custom<
      Partial<Omit<IMaterialDB, 'id' | 'projectId' | 'uploadId'>> & {
        projectId: string
        uploadId: string
      }
    >(),
    projectId: z.string(),
  })
)
export const updateMaterialBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
    updates: z
      .array(
        z.custom<
          Partial<Omit<IMaterialDB, 'id' | 'projectId' | 'uploadId'>> & {
            projectId: string
            uploadId: string
          }
        >()
      )
      .min(1, 'At least one update is required'),
    projectId: z.string(),
  })
)

// Delete material
export const deleteMaterialRequestApiSchema = defaultRequestSchema(
  z.object({
    materialId: z.string(),
    projectId: z.string(),
  })
)
export const deleteMaterialBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
    projectId: z.string(),
  })
)

// Create material types
export type CreateMaterialRequestApi = z.infer<typeof createMaterialRequestApiSchema>
export type CreateMaterialBulkRequestApi = z.infer<typeof createMaterialBulkRequestApiSchema>

// Create EC3 match types
export type CreateEC3MatchRequestApi = z.infer<typeof createEC3MatchRequestApiSchema>
export type CreateEC3BulkMatchRequestApi = z.infer<typeof createEC3BulkMatchRequestApiSchema>

// Get material types
export type GetMaterialRequestApi = z.infer<typeof getMaterialRequestApiSchema>
export type GetMaterialBulkRequestApi = z.infer<typeof getMaterialBulkRequestApiSchema>

// Update material types
export type UpdateMaterialRequestApi = z.infer<typeof updateMaterialRequestApiSchema>
export type UpdateMaterialBulkRequestApi = z.infer<typeof updateMaterialBulkRequestApiSchema>

// Delete material types
export type DeleteMaterialRequestApi = z.infer<typeof deleteMaterialRequestApiSchema>
export type DeleteMaterialBulkRequestApi = z.infer<typeof deleteMaterialBulkRequestApiSchema>
