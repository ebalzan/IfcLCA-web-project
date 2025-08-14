import { z } from 'zod'
import IUploadDB from '@/interfaces/uploads/IUploadDB'
import { defaultResponseSchema, paginationResponseSchema } from '../general'

// Create upload types
export const createUploadResponseSchema = defaultResponseSchema(z.custom<IUploadDB>())
export const createUploadBulkResponseSchema = defaultResponseSchema(z.array(z.custom<IUploadDB>()))

// Get upload types
export const getUploadResponseSchema = defaultResponseSchema(z.custom<IUploadDB>())
export const getUploadBulkResponseSchema = defaultResponseSchema(
  z.object({
    uploads: z.array(z.custom<IUploadDB>()),
    pagination: paginationResponseSchema,
  })
)

// Update upload types
export const updateUploadResponseSchema = defaultResponseSchema(z.custom<IUploadDB>())
export const updateUploadBulkResponseSchema = defaultResponseSchema(z.array(z.custom<IUploadDB>()))

// Delete upload types
export const deleteUploadResponseSchema = defaultResponseSchema(z.custom<IUploadDB>())
export const deleteUploadBulkResponseSchema = defaultResponseSchema(z.array(z.custom<IUploadDB>()))

// Create upload types
export type CreateUploadResponse = z.infer<typeof createUploadResponseSchema>
export type CreateUploadBulkResponse = z.infer<typeof createUploadBulkResponseSchema>

// Get upload types
export type GetUploadResponse = z.infer<typeof getUploadResponseSchema>
export type GetUploadBulkResponse = z.infer<typeof getUploadBulkResponseSchema>

// Update upload types
export type UpdateUploadResponse = z.infer<typeof updateUploadResponseSchema>
export type UpdateUploadBulkResponse = z.infer<typeof updateUploadBulkResponseSchema>

// Delete upload types
export type DeleteUploadResponse = z.infer<typeof deleteUploadResponseSchema>
export type DeleteUploadBulkResponse = z.infer<typeof deleteUploadBulkResponseSchema>
