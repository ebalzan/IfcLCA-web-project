import { z } from 'zod'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { defaultRequestSchemaApi, defaultQuerySchema } from '@/schemas/general'

// Create material
export const createMaterialRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.custom<
    Omit<IMaterialDB, '_id' | 'ec3MatchId' | 'projectId' | 'uploadId'> & {
      projectId: string
      uploadId: string
    }
  >(),
})
export const createMaterialBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    projectId: z.string(),
    materials: z.array(
      z.custom<
        Omit<IMaterialDB, '_id' | 'ec3MatchId' | 'projectId' | 'uploadId'> & {
          projectId: string
          uploadId: string
        }
      >()
    ),
  }),
})

// Create EC3 match
export const createEC3MatchRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({
    updates: z.custom<
      Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId' | 'projectId' | 'uploadId'>> &
        Pick<IEC3Match, 'score' | 'ec3MatchId' | 'autoMatched'>
    >(),
  }),
})
export const createEC3BulkMatchRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
    updates: z
      .array(
        z.custom<
          Partial<Omit<IMaterialDB, 'id' | 'ec3MatchId' | 'projectId' | 'uploadId'>> &
            Pick<IEC3Match, 'score' | 'ec3MatchId' | 'autoMatched'>
        >()
      )
      .min(1, 'At least one update is required'),
  }),
})

// Get material
export const getMaterialRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const getMaterialBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(
    z.object({
      materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
    })
  ),
  data: z.object({}),
})
export const getMaterialBulkByProjectRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(z.object({ projectId: z.string(), userId: z.string() })),
  data: z.object({}),
})
export const getMaterialBulkByUserRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: defaultQuerySchema(z.object({})),
  data: z.object({}),
})

// Update material
export const updateMaterialRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({
    updates: z.custom<Partial<Omit<IMaterialDB, 'id' | 'projectId' | 'uploadId'>>>(),
  }),
})
export const updateMaterialBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
    updates: z
      .array(z.custom<Partial<Omit<IMaterialDB, 'id' | 'projectId' | 'uploadId'>>>())
      .min(1, 'At least one update is required'),
  }),
})

// Delete material
export const deleteMaterialRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const deleteMaterialBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    materialIds: z.array(z.string()).min(1, 'At least one material ID is required'),
  }),
})

// Create material types
export type CreateMaterialRequestApi = z.infer<typeof createMaterialRequestApiSchema>
export type CreateMaterialBulkRequestApi = z.infer<typeof createMaterialBulkRequestApiSchema>

// Create EC3 match types
export type CreateEC3MatchRequestApi = z.infer<typeof createEC3MatchRequestApiSchema>
export type CreateEC3BulkMatchRequestApi = z.infer<typeof createEC3BulkMatchRequestApiSchema>

// Get material types
export type GetMaterialRequestApi = z.infer<typeof getMaterialRequestApiSchema>
export type GetMaterialBulkRequestApi = z.infer<typeof getMaterialBulkRequestApiSchema>
export type GetMaterialBulkByProjectRequestApi = z.infer<
  typeof getMaterialBulkByProjectRequestApiSchema
>
export type GetMaterialBulkByUserRequestApi = z.infer<typeof getMaterialBulkByUserRequestApiSchema>

// Update material types
export type UpdateMaterialRequestApi = z.infer<typeof updateMaterialRequestApiSchema>
export type UpdateMaterialBulkRequestApi = z.infer<typeof updateMaterialBulkRequestApiSchema>

// Delete material types
export type DeleteMaterialRequestApi = z.infer<typeof deleteMaterialRequestApiSchema>
export type DeleteMaterialBulkRequestApi = z.infer<typeof deleteMaterialBulkRequestApiSchema>
