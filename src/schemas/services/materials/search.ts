import { z } from 'zod'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import {
  defaultRequestSchema,
  defaultResponseSchema,
  paginationRequestSchema,
  paginationResponseSchema,
} from '../../general'

export const searchMaterialsQuerySchema = z.object({
  name: z.string().optional(),
  sortBy: z.string().optional(),
})

export const searchMaterialsRequestSchema = z.object({
  query: searchMaterialsQuerySchema.optional(),
  pagination: paginationRequestSchema,
})

export const searchMaterialsResponseSchema = defaultResponseSchema(
  z.object({
    materials: z.array(z.custom<IEC3Material>()),
    pagination: paginationResponseSchema,
  })
)

export type SearchMaterialsRequest = z.infer<typeof searchMaterialsRequestSchema>
export type SearchMaterialsResponse = z.infer<typeof searchMaterialsResponseSchema>
