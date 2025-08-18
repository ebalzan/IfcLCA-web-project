import { z } from 'zod'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { defaultResponseSchema, paginationResponseSchema } from '../general'

// Create project
export const createProjectResponseSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const createProjectBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>())
)

// Get project
export const getProjectResponseSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const getProjectBulkResponseSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()),
    pagination: paginationResponseSchema,
  })
)

// Get project with nested data
export const getProjectWithNestedDataResponseSchema = defaultResponseSchema(
  z.custom<IProjectWithNestedDataClient>()
)
export const getProjectWithNestedDataBulkResponseSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<IProjectWithNestedDataClient>()),
    pagination: paginationResponseSchema,
  })
)

// Update project
export const updateProjectResponseSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const updateProjectBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>())
)

// Delete project
export const deleteProjectResponseSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const deleteProjectBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>())
)

// Create project types
export type CreateProjectResponse = z.infer<typeof createProjectResponseSchema>
export type CreateProjectBulkResponse = z.infer<typeof createProjectBulkResponseSchema>

// Get project types
export type GetProjectResponse = z.infer<typeof getProjectResponseSchema>
export type GetProjectBulkResponse = z.infer<typeof getProjectBulkResponseSchema>

// Get project with nested data types
export type GetProjectWithNestedDataResponse = z.infer<
  typeof getProjectWithNestedDataResponseSchema
>
export type GetProjectWithNestedDataBulkResponse = z.infer<
  typeof getProjectWithNestedDataBulkResponseSchema
>

// Update project types
export type UpdateProjectResponse = z.infer<typeof updateProjectResponseSchema>
export type UpdateProjectBulkResponse = z.infer<typeof updateProjectBulkResponseSchema>

// Delete project types
export type DeleteProjectResponse = z.infer<typeof deleteProjectResponseSchema>
export type DeleteProjectBulkResponse = z.infer<typeof deleteProjectBulkResponseSchema>
