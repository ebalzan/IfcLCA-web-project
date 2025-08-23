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
    searchTerm: z.string().optional(),
    all: z.boolean().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    pagination: paginationRequestSchema,
  })
)
export const searchProjectsResponseSchema = defaultResponseSchema(
  z.object({
    projects: z.array(z.custom<Omit<IProjectDB, '_id'> & { _id: string }>()),
    pagination: paginationResponseSchema,
  })
)

export const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  all: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform(val => Math.max(1, parseInt(val || '1', 10))), // Page starts at 1
  size: z
    .string()
    .optional()
    .transform(val => Math.min(Math.max(parseInt(val || '10', 10), 1), 100)), // Clamp between 1-100
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

export type SearchProjectsRequest = z.infer<typeof searchProjectsRequestSchema>
export type SearchProjectsResponse = z.infer<typeof searchProjectsResponseSchema>

export type SearchResult = Pick<IProjectDB, 'name' | 'description'> & { _id: string }

export interface QueryConditions {
  userId: string
  $text?: { $search: string }
  $or?: Array<
    | { name: { $regex: string; $options: string } }
    | { description: { $regex: string; $options: string } }
  >
  createdAt?: {
    $gte?: Date
    $lte?: Date
  }
}

export interface SortObject {
  [key: string]: 1 | -1
}
