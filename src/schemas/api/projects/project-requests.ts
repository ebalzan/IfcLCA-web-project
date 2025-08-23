import { Types } from 'mongoose'
import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { defaultRequestSchema, paginationRequestSchema } from '@/schemas/general'

// Create project
export const createProjectRequestApiSchema = defaultRequestSchema(
  z.object({
    project: z.custom<Omit<IProjectDB, '_id' | 'userId'>>(),
    userId: z.string(),
  })
)
export const createProjectBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id' | 'userId'>>()),
    userId: z.string(),
  })
)

// Get project
export const getProjectRequestApiSchema = defaultRequestSchema(
  z.object({
    projectId: z.string(),
    userId: z.string(),
  })
)
export const getProjectBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.string()),
    userId: z.string(),
    pagination: paginationRequestSchema,
  })
)

// Get project with nested data
export const getProjectWithNestedDataRequestApiSchema = defaultRequestSchema(
  z.object({
    projectId: z.string(),
    userId: z.string(),
  })
)
export const getProjectWithNestedDataBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.string()),
    userId: z.string(),
    pagination: paginationRequestSchema,
  })
)

// Update project
export const updateProjectRequestApiSchema = defaultRequestSchema(
  z.object({
    projectId: z.string(),
    updates: z.custom<Partial<Omit<IProjectDB, '_id' | 'userId'>>>(),
    userId: z.string(),
  })
)
export const updateProjectBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.string()),
    updates: z.array(z.custom<Partial<Omit<IProjectDB, '_id' | 'userId'>>>()),
    userId: z.string(),
  })
)

// Delete project
export const deleteProjectRequestApiSchema = defaultRequestSchema(
  z.object({
    projectId: z.string(),
    userId: z.string(),
  })
)
export const deleteProjectBulkRequestApiSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.string()),
    userId: z.string(),
  })
)

// Create project types
export type CreateProjectRequestApi = z.infer<typeof createProjectRequestApiSchema>
export type CreateProjectBulkRequestApi = z.infer<typeof createProjectBulkRequestApiSchema>

// Get project types
export type GetProjectRequestApi = z.infer<typeof getProjectRequestApiSchema>
export type GetProjectBulkRequestApi = z.infer<typeof getProjectBulkRequestApiSchema>

// Get project with nested data types
export type GetProjectWithNestedDataRequestApi = z.infer<
  typeof getProjectWithNestedDataRequestApiSchema
>
export type GetProjectWithNestedDataBulkRequestApi = z.infer<
  typeof getProjectWithNestedDataBulkRequestApiSchema
>

// Update project types
export type UpdateProjectRequestApi = z.infer<typeof updateProjectRequestApiSchema>
export type UpdateProjectBulkRequestApi = z.infer<typeof updateProjectBulkRequestApiSchema>

// Delete project types
export type DeleteProjectRequestApi = z.infer<typeof deleteProjectRequestApiSchema>
export type DeleteProjectBulkRequestApi = z.infer<typeof deleteProjectBulkRequestApiSchema>
