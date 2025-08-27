import { z } from 'zod'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import {
  defaultRequestSchemaApi,
  defaultResponseSchema,
  paginationResponseSchema,
  defaultQuerySchema,
} from '@/schemas/general'

export const searchEC3MaterialsQuerySchemaApi = z.object({
  name: z.string().optional(),
  sortBy: z.string().optional(),
  fields: z.array(z.string()).optional(),
})

export const searchEC3MaterialsRequestSchemaApi = defaultRequestSchemaApi({
  pathParams: z.object({}),
  query: defaultQuerySchema(searchEC3MaterialsQuerySchemaApi),
  data: z.object({}),
})

export const searchEC3MaterialsResponseSchemaApi = defaultResponseSchema(
  z.object({
    materials: z.array(z.custom<IEC3Material>()),
    pagination: paginationResponseSchema,
  })
)

export type SearchEC3MaterialsRequestApi = z.infer<typeof searchEC3MaterialsRequestSchemaApi>
export type SearchEC3MaterialsResponseApi = z.infer<typeof searchEC3MaterialsResponseSchemaApi>
