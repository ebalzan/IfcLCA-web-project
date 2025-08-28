import { z } from 'zod'
import IUploadDB from '@/interfaces/uploads/IUploadDB'
import { defaultQuerySchema, defaultRequestSchemaApi } from '@/schemas/general'
import { ParseIFCFileRequest } from '@/schemas/services/ifc'

// Create upload
export const createUploadRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.custom<
    Omit<ParseIFCFileRequest['data'], 'projectId' | 'userId'> & { projectId: string }
  >(),
})
export const createUploadBulkRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    projectId: z.string(),
    uploads: z.array(
      z.custom<Omit<ParseIFCFileRequest['data'], 'projectId' | 'userId'> & { projectId: string }>()
    ),
  }),
})

// Get upload
export const getUploadRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const getUploadBulkRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(
    z.object({
      uploadIds: z.array(z.string()).min(1, 'At least one upload ID is required'),
    })
  ),
  data: z.object({}),
})
export const getUploadBulkByProjectRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(z.object({ projectId: z.string() })),
  data: z.object({}),
})

// Update upload
export const updateUploadRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({
    updates: z.custom<Partial<Omit<IUploadDB, '_id' | 'projectId'>> & { projectId: string }>(),
  }),
})
export const updateUploadBulkRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    uploadIds: z.array(z.string()),
    updates: z.array(
      z.custom<Partial<Omit<IUploadDB, '_id' | 'projectId'>> & { projectId: string }>()
    ),
  }),
})

// Delete upload
export const deleteUploadRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const deleteUploadBulkRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    uploadIds: z.array(z.string()),
  }),
})

// Create upload with IFC processing
export const createUploadWithIFCProcessingRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    file: z.instanceof(File),
    projectId: z.string(),
    userId: z.string(),
  }),
})

// Create upload types
export type CreateUploadRequestApi = z.infer<typeof createUploadRequestSchemaApi>
export type CreateUploadBulkRequestApi = z.infer<typeof createUploadBulkRequestSchemaApi>

// Get upload types
export type GetUploadRequestApi = z.infer<typeof getUploadRequestSchemaApi>
export type GetUploadBulkRequestApi = z.infer<typeof getUploadBulkRequestSchemaApi>
export type GetUploadBulkByProjectRequestApi = z.infer<
  typeof getUploadBulkByProjectRequestSchemaApi
>

// Update upload types
export type UpdateUploadRequestApi = z.infer<typeof updateUploadRequestSchemaApi>
export type UpdateUploadBulkRequestApi = z.infer<typeof updateUploadBulkRequestSchemaApi>

// Delete upload types
export type DeleteUploadRequestApi = z.infer<typeof deleteUploadRequestSchemaApi>
export type DeleteUploadBulkRequestApi = z.infer<typeof deleteUploadBulkRequestSchemaApi>

// Create upload with IFC processing types
export type CreateUploadWithIFCProcessingRequestApi = z.infer<
  typeof createUploadWithIFCProcessingRequestSchemaApi
>
