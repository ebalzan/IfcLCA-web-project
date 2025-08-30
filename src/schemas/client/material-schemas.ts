import { z } from 'zod'

// CREATE
export const createMaterialSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})
export const createMaterialBulkSchema = z.object({
  materials: z.array(createMaterialSchema),
})

// GET regular material
export const getMaterialSchema = z.object({
  id: z.string().min(1),
})
export const getMaterialBulkSchema = z.object({
  materialIds: z.array(z.string().min(1)),
})
export const getMaterialBulkByProjectSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
})
export const getMaterialBulkByUserSchema = z.object({
  userId: z.string().min(1),
})

// UPDATE
export const updateMaterialSchema = z.object({
  id: z.string().min(1),
  updates: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
})
export const updateMaterialBulkSchema = z.object({
  materialIds: z.array(z.string().min(1)),
  updates: z.array(updateMaterialSchema),
})

// DELETE
export const deleteMaterialSchema = z.object({
  id: z.string().min(1),
})
export const deleteMaterialBulkSchema = z.object({
  materialIds: z.array(z.string().min(1)),
})

// Search materials
export const searchMaterialsSchema = z.object({
  name: z.string().optional(),
  sortBy: z.string().optional(),
})
// Search EC3 materials
export const searchEC3MaterialsSchema = z.object({
  name: z.string().optional(),
  sortBy: z.string().optional(),
})

// Create types
export type CreateMaterialSchema = z.infer<typeof createMaterialSchema>
export type CreateMaterialBulkSchema = z.infer<typeof createMaterialBulkSchema>

// Get types
export type GetMaterialSchema = z.infer<typeof getMaterialSchema>
export type GetMaterialBulkSchema = z.infer<typeof getMaterialBulkSchema>
export type GetMaterialBulkByProjectSchema = z.infer<typeof getMaterialBulkByProjectSchema>
export type GetMaterialBulkByUserSchema = z.infer<typeof getMaterialBulkByUserSchema>

// Update types
export type UpdateMaterialSchema = z.infer<typeof updateMaterialSchema>
export type UpdateMaterialBulkSchema = z.infer<typeof updateMaterialBulkSchema>

// Delete types
export type DeleteMaterialSchema = z.infer<typeof deleteMaterialSchema>
export type DeleteMaterialBulkSchema = z.infer<typeof deleteMaterialBulkSchema>

// Search types
export type SearchMaterialsSchema = z.infer<typeof searchMaterialsSchema>
export type SearchEC3MaterialsSchema = z.infer<typeof searchEC3MaterialsSchema>
