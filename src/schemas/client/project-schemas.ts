import { z } from 'zod'

// CREATE
export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})
export const createProjectBulkSchema = z.object({
  projects: z.array(createProjectSchema),
})

// GET regular project
export const getProjectSchema = z.object({
  id: z.string().min(1),
})
export const getProjectBulkSchema = z.object({
  projectIds: z.array(z.string().min(1)),
})
export const getProjectBulkByUserSchema = z.object({
  userId: z.string().min(1),
})

// GET project with nested data
export const getProjectWithNestedDataSchema = z.object({
  id: z.string().min(1),
})
export const getProjectWithNestedDataBulkSchema = z.object({
  projectIds: z.array(z.string().min(1)),
})
export const getProjectWithNestedDataBulkByUserSchema = z.object({
  userId: z.string().min(1),
})

// UPDATE
export const updateProjectSchema = z.object({
  id: z.string().min(1),
})
export const updateProjectBulkSchema = z.object({
  projectIds: z.array(z.string().min(1)),
})

// DELETE
export const deleteProjectSchema = z.object({
  id: z.string().min(1),
})
export const deleteProjectBulkSchema = z.object({
  projectIds: z.array(z.string().min(1)),
})

// Search projects
export const searchProjectsSchema = z.object({
  name: z.string().optional(),
  sortBy: z.string().optional(),
})

// Create types
export type CreateProjectSchema = z.infer<typeof createProjectSchema>
export type CreateProjectBulkSchema = z.infer<typeof createProjectBulkSchema>

// Get types
export type GetProjectSchema = z.infer<typeof getProjectSchema>
export type GetProjectBulkSchema = z.infer<typeof getProjectBulkSchema>
export type GetProjectBulkByUserSchema = z.infer<typeof getProjectBulkByUserSchema>
export type GetProjectWithNestedDataSchema = z.infer<typeof getProjectWithNestedDataSchema>
export type GetProjectWithNestedDataBulkSchema = z.infer<typeof getProjectWithNestedDataBulkSchema>
export type GetProjectWithNestedDataBulkByUserSchema = z.infer<
  typeof getProjectWithNestedDataBulkByUserSchema
>

// Update types
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>
export type UpdateProjectBulkSchema = z.infer<typeof updateProjectBulkSchema>

// Delete types
export type DeleteProjectSchema = z.infer<typeof deleteProjectSchema>
export type DeleteProjectBulkSchema = z.infer<typeof deleteProjectBulkSchema>

// Search types
export type SearchProjectsSchema = z.infer<typeof searchProjectsSchema>
