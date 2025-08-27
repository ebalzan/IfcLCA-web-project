import { z } from 'zod'
import { IProjectClient } from '@/interfaces/client/projects/IProjectClient'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'
import { defaultResponseSchema, paginationResponseSchema } from '@/schemas/general'

// Create project
export const createProjectResponseApiSchema = defaultResponseSchema(z.custom<IProjectClient>())
export const createProjectBulkResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<IProjectClient>())
)

// Get project
export const getProjectResponseApiSchema = defaultResponseSchema(z.custom<IProjectClient>())
export const getProjectBulkResponseApiSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<IProjectClient>()),
    pagination: paginationResponseSchema,
  })
)
export const getProjectBulkByUserResponseApiSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<IProjectClient>()),
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
export const getProjectWithNestedDataBulkByUserResponseApiSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<IProjectWithNestedDataClient>()),
    pagination: paginationResponseSchema,
  })
)

// Update project
export const updateProjectResponseApiSchema = defaultResponseSchema(z.custom<IProjectClient>())
export const updateProjectBulkResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<IProjectClient>())
)

// Delete project
export const deleteProjectResponseApiSchema = defaultResponseSchema(z.custom<IProjectClient>())
export const deleteProjectBulkResponseApiSchema = defaultResponseSchema(
  z.array(z.custom<IProjectClient>())
)

// Create project types
export type CreateProjectResponseApi = z.infer<typeof createProjectResponseApiSchema>
export type CreateProjectBulkResponseApi = z.infer<typeof createProjectBulkResponseApiSchema>

// Get project types
export type GetProjectResponseApi = z.infer<typeof getProjectResponseApiSchema>
export type GetProjectBulkResponseApi = z.infer<typeof getProjectBulkResponseApiSchema>
export type GetProjectBulkByUserResponseApi = z.infer<typeof getProjectBulkByUserResponseApiSchema>

// Get project with nested data types
export type GetProjectWithNestedDataResponseApi = z.infer<
  typeof getProjectWithNestedDataResponseApiSchema
>
export type GetProjectWithNestedDataBulkResponseApi = z.infer<
  typeof getProjectWithNestedDataBulkResponseApiSchema
>
export type GetProjectWithNestedDataBulkByUserResponseApi = z.infer<
  typeof getProjectWithNestedDataBulkByUserResponseApiSchema
>

// Update project types
export type UpdateProjectResponseApi = z.infer<typeof updateProjectResponseApiSchema>
export type UpdateProjectBulkResponseApi = z.infer<typeof updateProjectBulkResponseApiSchema>

// Delete project types
export type DeleteProjectResponseApi = z.infer<typeof deleteProjectResponseApiSchema>
export type DeleteProjectBulkResponseApi = z.infer<typeof deleteProjectBulkResponseApiSchema>
