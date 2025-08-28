import { z } from 'zod'
import { ParseIFCFileRequest } from '../services/ifc'

// CREATE
export const createUploadSchema = z.custom<ParseIFCFileRequest['data']>()
export const createUploadBulkSchema = z.object({
  uploads: z.array(createUploadSchema),
})

// GET regular upload
export const getUploadSchema = z.object({
  id: z.string().min(1),
})
export const getUploadBulkSchema = z.object({
  uploadIds: z.array(z.string().min(1)),
})
export const getUploadBulkByProjectSchema = z.object({
  projectId: z.string().min(1),
})

// UPDATE
export const updateUploadSchema = z.object({
  id: z.string().min(1),
  updates: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
})
export const updateUploadBulkSchema = z.object({
  uploadIds: z.array(z.string().min(1)),
  updates: z.array(updateUploadSchema),
})

// DELETE
export const deleteUploadSchema = z.object({
  id: z.string().min(1),
})
export const deleteUploadBulkSchema = z.object({
  uploadIds: z.array(z.string().min(1)),
})

// Create types
export type CreateUploadSchema = z.infer<typeof createUploadSchema>
export type CreateUploadBulkSchema = z.infer<typeof createUploadBulkSchema>

// Get types
export type GetUploadSchema = z.infer<typeof getUploadSchema>
export type GetUploadBulkSchema = z.infer<typeof getUploadBulkSchema>
export type GetUploadBulkByProjectSchema = z.infer<typeof getUploadBulkByProjectSchema>

// Update types
export type UpdateUploadSchema = z.infer<typeof updateUploadSchema>
export type UpdateUploadBulkSchema = z.infer<typeof updateUploadBulkSchema>

// Delete types
export type DeleteUploadSchema = z.infer<typeof deleteUploadSchema>
export type DeleteUploadBulkSchema = z.infer<typeof deleteUploadBulkSchema>
