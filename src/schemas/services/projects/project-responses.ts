import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { IProjectWithNestedData } from '@/interfaces/projects/IProjectWithNestedData'
import { paginationResponseSchema } from '@/schemas/general'

// Create project
export const createProjectResponseSchema = z.custom<IProjectDB>()
export const createProjectBulkResponseSchema = z.array(z.custom<IProjectDB>())

// Get project
export const getProjectResponseSchema = z.custom<IProjectDB>()
export const getProjectBulkResponseSchema = z.object({
  projects: z.array(z.custom<IProjectDB>()),
  pagination: paginationResponseSchema.optional(),
})
export const getProjectBulkByUserResponseSchema = z.object({
  projects: z.array(z.custom<IProjectDB>()),
  pagination: paginationResponseSchema.optional(),
})

// Get project with nested data
export const getProjectWithNestedDataResponseSchema = z.custom<IProjectWithNestedData>()
export const getProjectWithNestedDataBulkResponseSchema = z.object({
  projects: z.array(z.custom<IProjectWithNestedData>()),
  pagination: paginationResponseSchema.optional(),
})
export const getProjectWithNestedDataBulkByUserResponseSchema = z.object({
  projects: z.array(z.custom<IProjectWithNestedData>()),
  pagination: paginationResponseSchema.optional(),
})

// Update project
export const updateProjectResponseSchema = z.custom<IProjectDB>()
export const updateProjectBulkResponseSchema = z.array(z.custom<IProjectDB>())

// Delete project
export const deleteProjectResponseSchema = z.custom<IProjectDB>()
export const deleteProjectBulkResponseSchema = z.array(z.custom<IProjectDB>())

// Create project types
export type CreateProjectResponse = z.infer<typeof createProjectResponseSchema>
export type CreateProjectBulkResponse = z.infer<typeof createProjectBulkResponseSchema>

// Get project types
export type GetProjectResponse = z.infer<typeof getProjectResponseSchema>
export type GetProjectBulkResponse = z.infer<typeof getProjectBulkResponseSchema>
export type GetProjectBulkByUserResponse = z.infer<typeof getProjectBulkByUserResponseSchema>

// Get project with nested data types
export type GetProjectWithNestedDataResponse = z.infer<
  typeof getProjectWithNestedDataResponseSchema
>
export type GetProjectWithNestedDataBulkResponse = z.infer<
  typeof getProjectWithNestedDataBulkResponseSchema
>
export type GetProjectWithNestedDataBulkByUserResponse = z.infer<
  typeof getProjectWithNestedDataBulkByUserResponseSchema
>

// Update project types
export type UpdateProjectResponse = z.infer<typeof updateProjectResponseSchema>
export type UpdateProjectBulkResponse = z.infer<typeof updateProjectBulkResponseSchema>

// Delete project types
export type DeleteProjectResponse = z.infer<typeof deleteProjectResponseSchema>
export type DeleteProjectBulkResponse = z.infer<typeof deleteProjectBulkResponseSchema>
