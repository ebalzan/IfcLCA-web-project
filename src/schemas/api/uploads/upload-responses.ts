import { z } from 'zod'
import { IUploadClient } from '@/interfaces/client/uploads/IUploadClient'
import { defaultResponseSchema, paginationResponseSchema } from '@/schemas/general'
import { ParseIFCFileResponse } from '@/schemas/services/ifc'

// Create upload types
export const createUploadResponseSchemaApi = defaultResponseSchema(
  z.custom<
    Omit<ParseIFCFileResponse['data'], 'uploadId' | 'projectId'> & {
      uploadId: string
      projectId: string
    }
  >()
)
export const createUploadBulkResponseSchemaApi = defaultResponseSchema(
  z.array(createUploadResponseSchemaApi)
)

// Get upload types
export const getUploadResponseSchemaApi = defaultResponseSchema(z.custom<IUploadClient>())
export const getUploadBulkResponseSchemaApi = defaultResponseSchema(
  z.object({
    uploads: z.array(z.custom<IUploadClient>()),
    pagination: paginationResponseSchema,
  })
)
export const getUploadBulkByProjectResponseSchemaApi = defaultResponseSchema(
  z.object({
    uploads: z.array(z.custom<IUploadClient>()),
    pagination: paginationResponseSchema,
  })
)

// Update upload types
export const updateUploadResponseSchemaApi = defaultResponseSchema(z.custom<IUploadClient>())
export const updateUploadBulkResponseSchemaApi = defaultResponseSchema(
  z.array(z.custom<IUploadClient>())
)

// Delete upload types
export const deleteUploadResponseSchemaApi = defaultResponseSchema(z.custom<IUploadClient>())
export const deleteUploadBulkResponseSchemaApi = defaultResponseSchema(
  z.array(z.custom<IUploadClient>())
)

// Create upload types
export type CreateUploadResponseApi = z.infer<typeof createUploadResponseSchemaApi>
export type CreateUploadBulkResponseApi = z.infer<typeof createUploadBulkResponseSchemaApi>

// Get upload types
export type GetUploadResponseApi = z.infer<typeof getUploadResponseSchemaApi>
export type GetUploadBulkResponseApi = z.infer<typeof getUploadBulkResponseSchemaApi>
export type GetUploadBulkByProjectResponseApi = z.infer<
  typeof getUploadBulkByProjectResponseSchemaApi
>

// Update upload types
export type UpdateUploadResponseApi = z.infer<typeof updateUploadResponseSchemaApi>
export type UpdateUploadBulkResponseApi = z.infer<typeof updateUploadBulkResponseSchemaApi>

// Delete upload types
export type DeleteUploadResponseApi = z.infer<typeof deleteUploadResponseSchemaApi>
export type DeleteUploadBulkResponseApi = z.infer<typeof deleteUploadBulkResponseSchemaApi>
