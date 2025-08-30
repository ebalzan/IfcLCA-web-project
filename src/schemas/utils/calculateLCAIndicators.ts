import { z } from 'zod'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
import { defaultRequestSchema, defaultResponseSchema } from '@/schemas/general'

const calculateElementIndicatorsRequestSchema = defaultRequestSchema(
  z.object({
    volume: z.number(),
    density: z.number().optional(),
    ec3Material: z.custom<IEC3Material>().nullable(),
  })
)
const calculateElementIndicatorsResponseSchema = z.custom<ILCAIndicators>()

export type CalculateElementIndicatorsRequest = z.infer<
  typeof calculateElementIndicatorsRequestSchema
>
export type CalculateElementIndicatorsResponse = z.infer<
  typeof calculateElementIndicatorsResponseSchema
>
