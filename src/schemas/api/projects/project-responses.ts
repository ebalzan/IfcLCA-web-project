import { z } from 'zod'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { defaultResponseSchema, paginationResponseSchema } from '@/schemas/general'

// Create project
export const createProjectResponseApiSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const createProjectBulkResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>())
)

// Get project
export const getProjectResponseApiSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const getProjectBulkResponseApiSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()),
    pagination: paginationResponseSchema,
  })
)

// Get project with nested data
export const getProjectWithNestedDataResponseApiSchema = defaultResponseSchema(
  z.custom<IProjectWithNestedDataClient>()
)
export const getProjectWithNestedDataBulkResponseApiSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<IProjectWithNestedDataClient>()),
    pagination: paginationResponseSchema,
  })
)

// Update project
export const updateProjectResponseApiSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const updateProjectBulkResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>())
)

// Delete project
export const deleteProjectResponseApiSchema = defaultResponseSchema(
  z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()
)
export const deleteProjectBulkResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>())
)

// Create project types
export type CreateProjectResponseApi = z.infer<typeof createProjectResponseApiSchema>
export type CreateProjectBulkResponseApi = z.infer<typeof createProjectBulkResponseApiSchema>

// Get project types
export type GetProjectResponseApi = z.infer<typeof getProjectResponseApiSchema>
export type GetProjectBulkResponseApi = z.infer<typeof getProjectBulkResponseApiSchema>

// Get project with nested data types
export type GetProjectWithNestedDataResponseApi = z.infer<
  typeof getProjectWithNestedDataResponseApiSchema
>
export type GetProjectWithNestedDataBulkResponseApi = z.infer<
  typeof getProjectWithNestedDataBulkResponseApiSchema
>

// Update project types
export type UpdateProjectResponseApi = z.infer<typeof updateProjectResponseApiSchema>
export type UpdateProjectBulkResponseApi = z.infer<typeof updateProjectBulkResponseApiSchema>

// Delete project types
export type DeleteProjectResponseApi = z.infer<typeof deleteProjectResponseApiSchema>
export type DeleteProjectBulkResponseApi = z.infer<typeof deleteProjectBulkResponseApiSchema>
