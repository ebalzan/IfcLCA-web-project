import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import {
  defaultQuerySchema,
  defaultRequestSchemaApi,
  defaultResponseSchema,
  paginationResponseSchema,
} from '@/schemas/general'

export const searchProjectsQuerySchemaApi = z.object({
  name: z.string().optional(),
  sortBy: z.string().optional(),
})

export const searchProjectsRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(searchProjectsQuerySchemaApi),
  data: z.object({}),
})

export const searchProjectsResponseSchemaApi = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()),
    pagination: paginationResponseSchema,
  })
)

export type SearchProjectsRequestApi = z.infer<typeof searchProjectsRequestSchemaApi>
export type SearchProjectsResponseApi = z.infer<typeof searchProjectsResponseSchemaApi>
