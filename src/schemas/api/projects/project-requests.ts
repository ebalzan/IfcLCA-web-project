import { Types } from 'mongoose'
import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { defaultRequestSchema, paginationRequestSchema } from '../general'

// Create project
export const createProjectRequestSchema = defaultRequestSchema(
  z.object({
    project: z.custom<Omit<IProjectDB, '_id' | 'userId'>>(),
    userId: z.string(),
  })
)
export const createProjectBulkRequestSchema = defaultRequestSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id' | 'userId'>>()),
    userId: z.string(),
  })
)

// Get project
export const getProjectRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    userId: z.string(),
  })
)
export const getProjectBulkRequestSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.custom<Types.ObjectId>()),
    userId: z.string(),
    pagination: paginationRequestSchema,
  })
)

// Get project with nested data
export const getProjectWithNestedDataRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    userId: z.string(),
  })
)
export const getProjectWithNestedDataBulkRequestSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.custom<Types.ObjectId>()),
    userId: z.string(),
    pagination: paginationRequestSchema,
  })
)

// Update project
export const updateProjectRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    updates: z.custom<Partial<Omit<IProjectDB, '_id' | 'userId'>>>(),
    userId: z.string(),
  })
)
export const updateProjectBulkRequestSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.custom<Types.ObjectId>()),
    updates: z.array(z.custom<Partial<Omit<IProjectDB, '_id' | 'userId'>>>()),
    userId: z.string(),
  })
)

// Delete project
export const deleteProjectRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    userId: z.string(),
  })
)
export const deleteProjectBulkRequestSchema = defaultRequestSchema(
  z.object({
    projectIds: z.array(z.custom<Types.ObjectId>()),
    userId: z.string(),
  })
)

// Create project types
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>
export type CreateProjectBulkRequest = z.infer<typeof createProjectBulkRequestSchema>

// Get project types
export type GetProjectRequest = z.infer<typeof getProjectRequestSchema>
export type GetProjectBulkRequest = z.infer<typeof getProjectBulkRequestSchema>

// Get project with nested data types
export type GetProjectWithNestedDataRequest = z.infer<typeof getProjectWithNestedDataRequestSchema>
export type GetProjectWithNestedDataBulkRequest = z.infer<
  typeof getProjectWithNestedDataBulkRequestSchema
>

// Update project types
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>
export type UpdateProjectBulkRequest = z.infer<typeof updateProjectBulkRequestSchema>

// Delete project types
export type DeleteProjectRequest = z.infer<typeof deleteProjectRequestSchema>
export type DeleteProjectBulkRequest = z.infer<typeof deleteProjectBulkRequestSchema>
