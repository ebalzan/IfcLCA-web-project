import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { IProjectWithNestedData } from '@/interfaces/projects/IProjectWithNestedData'
import { defaultResponseSchema } from '../general'

// Create project
export const createProjectResponseSchema = defaultResponseSchema(z.custom<IProjectDB>())
export const createProjectBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IProjectDB>())
)

// Get project
export const getProjectResponseSchema = defaultResponseSchema(z.custom<IProjectDB>())
export const getProjectBulkResponseSchema = defaultResponseSchema(z.array(z.custom<IProjectDB>()))

// Get project with nested data
export const getProjectWithNestedDataResponseSchema = defaultResponseSchema(
  z.custom<IProjectWithNestedData>()
)
export const getProjectWithNestedDataBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IProjectWithNestedData>())
)

// Update project
export const updateProjectResponseSchema = defaultResponseSchema(z.custom<IProjectDB>())
export const updateProjectBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IProjectDB>())
)

// Delete project
export const deleteProjectResponseSchema = defaultResponseSchema(z.custom<IProjectDB>())
export const deleteProjectBulkResponseSchema = defaultResponseSchema(
  z.array(z.custom<IProjectDB>())
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
