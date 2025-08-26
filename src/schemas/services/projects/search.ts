import { z } from 'zod'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import {
  defaultRequestSchema,
  defaultResponseSchema,
  paginationRequestSchema,
  paginationResponseSchema,
} from '../../general'

export const searchProjectsRequestSchema = defaultRequestSchema(
  z.object({
    userId: z.string(),
    name: z.string().optional(),
    sortBy: z.string().optional(),
    pagination: paginationRequestSchema,
  })
)
export const searchProjectsResponseSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()),
    pagination: paginationResponseSchema,
  })
)

export type SearchProjectsRequest = z.infer<typeof searchProjectsRequestSchema>
export type SearchProjectsResponse = z.infer<typeof searchProjectsResponseSchema>
