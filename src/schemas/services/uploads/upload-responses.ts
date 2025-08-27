import { z } from 'zod'
import IUploadDB from '@/interfaces/uploads/IUploadDB'
import { paginationResponseSchema } from '@/schemas/general'

// Create upload types
export const createUploadResponseSchema = z.custom<IUploadDB>()
export const createUploadBulkResponseSchema = z.array(z.custom<IUploadDB>())

// Get upload types
export const getUploadResponseSchema = z.custom<IUploadDB>()
export const getUploadBulkResponseSchema = z.object({
  uploads: z.array(z.custom<IUploadDB>()),
  pagination: paginationResponseSchema.optional(),
})
export const getUploadBulkByProjectResponseSchema = z.object({
  uploads: z.array(z.custom<IUploadDB>()),
  pagination: paginationResponseSchema.optional(),
})

// Update upload types
export const updateUploadResponseSchema = z.custom<IUploadDB>()
export const updateUploadBulkResponseSchema = z.array(z.custom<IUploadDB>())

// Delete upload types
export const deleteUploadResponseSchema = z.custom<IUploadDB>()
export const deleteUploadBulkResponseSchema = z.array(z.custom<IUploadDB>())

// Create upload with IFC processing
export const createUploadWithIFCProcessingResponseSchema = z.custom<IUploadDB>()

// Create upload types
export type CreateUploadResponse = z.infer<typeof createUploadResponseSchema>
export type CreateUploadBulkResponse = z.infer<typeof createUploadBulkResponseSchema>

// Get upload types
export type GetUploadResponse = z.infer<typeof getUploadResponseSchema>
export type GetUploadBulkResponse = z.infer<typeof getUploadBulkResponseSchema>
export type GetUploadBulkByProjectResponse = z.infer<typeof getUploadBulkByProjectResponseSchema>

// Update upload types
export type UpdateUploadResponse = z.infer<typeof updateUploadResponseSchema>
export type UpdateUploadBulkResponse = z.infer<typeof updateUploadBulkResponseSchema>

// Delete upload types
export type DeleteUploadResponse = z.infer<typeof deleteUploadResponseSchema>
export type DeleteUploadBulkResponse = z.infer<typeof deleteUploadBulkResponseSchema>

// Create upload with IFC processing types
export type CreateUploadWithIFCProcessingResponse = z.infer<
  typeof createUploadWithIFCProcessingResponseSchema
>
