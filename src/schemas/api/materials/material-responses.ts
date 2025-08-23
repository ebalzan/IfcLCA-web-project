import { z } from 'zod'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { defaultResponseSchema, paginationResponseSchema } from '../../general'

export type EC3MatchData = Omit<IEC3Match, '_id' | 'materialId'> & {
  materialId: string
  _id: string
}

// Create material types
export const createMaterialResponseApiSchema = defaultResponseSchema(
  z.custom<
    Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
      _id: string
      projectId: string
      uploadId: string
    }
  >()
)
export const createMaterialBulkResponseApiSchema = defaultResponseSchema(
  z.array(
    z.custom<
      Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
        _id: string
        projectId: string
        uploadId: string
      }
    >()
  )
)

// Create EC3 match types
export const createEC3MatchResponseApiSchema = defaultResponseSchema(
  z.custom<EC3MatchData | null>()
)
export const createEC3BulkMatchResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<EC3MatchData>())
)

// Get material types
export const getMaterialResponseApiSchema = defaultResponseSchema(
  z.custom<
    Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
      _id: string
      projectId: string
      uploadId: string
    }
  >()
)
export const getMaterialBulkResponseApiSchema = defaultResponseSchema(
  z.object({
    materials: z.array(
      z.custom<
        Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
          _id: string
          projectId: string
          uploadId: string
        }
      >()
    ),
    pagination: paginationResponseSchema,
  })
)

// Update material types
export const updateMaterialResponseApiSchema = defaultResponseSchema(
  z.custom<
    Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
      _id: string
      projectId: string
      uploadId: string
    }
  >()
)
export const updateMaterialBulkResponseApiSchema = defaultResponseSchema(
  z.array(
    z.custom<
      Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
        _id: string
        projectId: string
        uploadId: string
      }
    >()
  )
)

// Delete material types
export const deleteMaterialResponseApiSchema = defaultResponseSchema(
  z.custom<
    Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
      _id: string
      projectId: string
      uploadId: string
    }
  >()
)
export const deleteMaterialBulkResponseApiSchema = defaultResponseSchema(
  z.array(
    z.custom<
      Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'> & {
        _id: string
        projectId: string
        uploadId: string
      }
    >()
  )
)

// Create material types
export type CreateMaterialResponseApi = z.infer<typeof createMaterialResponseApiSchema>
export type CreateMaterialBulkResponseApi = z.infer<typeof createMaterialBulkResponseApiSchema>

// Create EC3 match types
export type CreateEC3MatchResponseApi = z.infer<typeof createEC3MatchResponseApiSchema>
export type CreateEC3BulkMatchResponseApi = z.infer<typeof createEC3BulkMatchResponseApiSchema>

// Get material types
export type GetMaterialResponseApi = z.infer<typeof getMaterialResponseApiSchema>
export type GetMaterialBulkResponseApi = z.infer<typeof getMaterialBulkResponseApiSchema>

// Update material types
export type UpdateMaterialResponseApi = z.infer<typeof updateMaterialResponseApiSchema>
export type UpdateMaterialBulkResponseApi = z.infer<typeof updateMaterialBulkResponseApiSchema>

// Delete material types
export type DeleteMaterialResponseApi = z.infer<typeof deleteMaterialResponseApiSchema>
export type DeleteMaterialBulkResponseApi = z.infer<typeof deleteMaterialBulkResponseApiSchema>
