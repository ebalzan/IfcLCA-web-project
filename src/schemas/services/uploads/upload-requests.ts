import { Types } from 'mongoose'
import { z } from 'zod'
import IUploadDB from '@/interfaces/uploads/IUploadDB'
import { defaultRequestSchema, paginationRequestSchema } from '@/schemas/general'

// Create upload
export const createUploadRequestSchema = defaultRequestSchema(
  z.object({
    upload: z.custom<Omit<IUploadDB, '_id' | 'userId'>>(),
    userId: z.string(),
  })
)
export const createUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploads: z.array(z.custom<Omit<IUploadDB, '_id' | 'userId'>>()),
    projectId: z.custom<Types.ObjectId>(),
    userId: z.string(),
  })
)

// Get upload
export const getUploadRequestSchema = defaultRequestSchema(
  z.object({
    uploadId: z.custom<Types.ObjectId>(),
  })
)
export const getUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploadIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one upload ID is required'),
    pagination: paginationRequestSchema.optional(),
  })
)
export const getUploadBulkByProjectRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    pagination: paginationRequestSchema.optional(),
  })
)

// Update upload
export const updateUploadRequestSchema = defaultRequestSchema(
  z.object({
    uploadId: z.custom<Types.ObjectId>(),
    updates: z.custom<Partial<Omit<IUploadDB, '_id'>>>(),
  })
)
export const updateUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploadIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one upload ID is required'),
    updates: z
      .array(z.custom<Partial<Omit<IUploadDB, '_id' | 'projectId'>>>())
      .min(1, 'At least one update is required'),
  })
)

// Delete upload
export const deleteUploadRequestSchema = defaultRequestSchema(
  z.object({
    uploadId: z.custom<Types.ObjectId>(),
  })
)
export const deleteUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploadIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one upload ID is required'),
  })
)

// Create upload with IFC processing
export const createUploadWithIFCProcessingRequestSchema = defaultRequestSchema(
  z.object({
    file: z.instanceof(File),
    projectId: z.custom<Types.ObjectId>(),
    userId: z.string(),
  })
)

// Create upload types
export type CreateUploadRequest = z.infer<typeof createUploadRequestSchema>
export type CreateUploadBulkRequest = z.infer<typeof createUploadBulkRequestSchema>

// Get upload types
export type GetUploadRequest = z.infer<typeof getUploadRequestSchema>
export type GetUploadBulkRequest = z.infer<typeof getUploadBulkRequestSchema>
export type GetUploadBulkByProjectRequest = z.infer<typeof getUploadBulkByProjectRequestSchema>

// Update upload types
export type UpdateUploadRequest = z.infer<typeof updateUploadRequestSchema>
export type UpdateUploadBulkRequest = z.infer<typeof updateUploadBulkRequestSchema>

// Delete upload types
export type DeleteUploadRequest = z.infer<typeof deleteUploadRequestSchema>
export type DeleteUploadBulkRequest = z.infer<typeof deleteUploadBulkRequestSchema>

// Create upload with IFC processing types
export type CreateUploadWithIFCProcessingRequest = z.infer<
  typeof createUploadWithIFCProcessingRequestSchema
>
