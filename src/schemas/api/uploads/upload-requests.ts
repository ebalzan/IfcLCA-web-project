import { Types } from 'mongoose'
import { z } from 'zod'
import IUploadDB from '@/interfaces/uploads/IUploadDB'
import { defaultRequestSchema, paginationRequestSchema } from '../general'

// Create upload
export const createUploadRequestSchema = defaultRequestSchema(z.custom<Omit<IUploadDB, '_id'>>())
export const createUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploads: z.array(z.custom<Omit<IUploadDB, '_id'>>()),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Get upload
export const getUploadRequestSchema = defaultRequestSchema(
  z.object({
    uploadId: z.custom<Types.ObjectId>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const getUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploadIds: z.array(z.custom<Types.ObjectId>()),
    projectId: z.custom<Types.ObjectId>().optional(),
    pagination: paginationRequestSchema,
  })
)

// Update upload
export const updateUploadRequestSchema = defaultRequestSchema(
  z.object({
    uploadId: z.custom<Types.ObjectId>(),
    updates: z.custom<Partial<Omit<IUploadDB, '_id'>>>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const updateUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploadIds: z.array(z.custom<Types.ObjectId>()),
    updates: z.array(z.custom<Partial<Omit<IUploadDB, '_id'>>>()),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Delete upload
export const deleteUploadRequestSchema = defaultRequestSchema(
  z.object({
    uploadId: z.custom<Types.ObjectId>(),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)
export const deleteUploadBulkRequestSchema = defaultRequestSchema(
  z.object({
    uploadIds: z.array(z.custom<Types.ObjectId>()),
    projectId: z.custom<Types.ObjectId>().optional(),
  })
)

// Create upload types
export type CreateUploadRequest = z.infer<typeof createUploadRequestSchema>
export type CreateUploadBulkRequest = z.infer<typeof createUploadBulkRequestSchema>

// Get upload types
export type GetUploadRequest = z.infer<typeof getUploadRequestSchema>
export type GetUploadBulkRequest = z.infer<typeof getUploadBulkRequestSchema>

// Update upload types
export type UpdateUploadRequest = z.infer<typeof updateUploadRequestSchema>
export type UpdateUploadBulkRequest = z.infer<typeof updateUploadBulkRequestSchema>

// Delete upload types
export type DeleteUploadRequest = z.infer<typeof deleteUploadRequestSchema>
export type DeleteUploadBulkRequest = z.infer<typeof deleteUploadBulkRequestSchema>
