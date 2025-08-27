import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { defaultRequestSchemaApi, defaultQuerySchema } from '@/schemas/general'

// Create project
export const createProjectRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    project: z.custom<Omit<IProjectDB, '_id' | 'userId'>>(),
  }),
})
export const createProjectBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id' | 'userId'>>()),
  }),
})

// Get project
export const getProjectRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const getProjectBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(
    z.object({
      projectIds: z.array(z.string()).min(1, 'At least one project ID is required'),
    })
  ),
  data: z.object({}),
})
export const getProjectBulkByUserRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: defaultQuerySchema(z.object({})),
  data: z.object({}),
})

// Get project with nested data
export const getProjectWithNestedDataRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const getProjectWithNestedDataBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(
    z.object({
      projectIds: z.array(z.string()).min(1, 'At least one project ID is required'),
    })
  ),
  data: z.object({}),
})
export const getProjectWithNestedDataBulkByUserRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: defaultQuerySchema(z.object({})),
  data: z.object({}),
})

// Update project
export const updateProjectRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({
    updates: z.custom<Partial<Omit<IProjectDB, '_id' | 'userId'>>>(),
  }),
})
export const updateProjectBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    projectIds: z.array(z.string()),
    updates: z.array(z.custom<Partial<Omit<IProjectDB, '_id' | 'userId'>>>()),
  }),
})

// Delete project
export const deleteProjectRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({ id: z.string() }),
  query: z.object({}),
  data: z.object({}),
})
export const deleteProjectBulkRequestApiSchema = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: z.object({}),
  data: z.object({
    projectIds: z.array(z.string()),
  }),
})

// Create project types
export type CreateProjectRequestApi = z.infer<typeof createProjectRequestApiSchema>
export type CreateProjectBulkRequestApi = z.infer<typeof createProjectBulkRequestApiSchema>

// Get project types
export type GetProjectRequestApi = z.infer<typeof getProjectRequestApiSchema>
export type GetProjectBulkRequestApi = z.infer<typeof getProjectBulkRequestApiSchema>
export type GetProjectBulkByUserRequestApi = z.infer<typeof getProjectBulkByUserRequestApiSchema>

// Get project with nested data types
export type GetProjectWithNestedDataRequestApi = z.infer<
  typeof getProjectWithNestedDataRequestApiSchema
>
export type GetProjectWithNestedDataBulkRequestApi = z.infer<
  typeof getProjectWithNestedDataBulkRequestApiSchema
>
export type GetProjectWithNestedDataBulkByUserRequestApi = z.infer<
  typeof getProjectWithNestedDataBulkByUserRequestApiSchema
>

// Update project types
export type UpdateProjectRequestApi = z.infer<typeof updateProjectRequestApiSchema>
export type UpdateProjectBulkRequestApi = z.infer<typeof updateProjectBulkRequestApiSchema>

// Delete project types
export type DeleteProjectRequestApi = z.infer<typeof deleteProjectRequestApiSchema>
export type DeleteProjectBulkRequestApi = z.infer<typeof deleteProjectBulkRequestApiSchema>
