import { Types } from 'mongoose'
import { z } from 'zod'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
import { defaultRequestSchema, defaultResponseSchema } from '@/schemas/general'

const calculateElementIndicatorsRequestSchema = defaultRequestSchema(
  z.object({
    elementId: z.custom<Types.ObjectId>(),
  })
)
const calculateElementIndicatorsResponseSchema = defaultResponseSchema(z.custom<ILCAIndicators>())

export type CalculateElementIndicatorsRequest = z.infer<
  typeof calculateElementIndicatorsRequestSchema
>
export type CalculateElementIndicatorsResponse = z.infer<
  typeof calculateElementIndicatorsResponseSchema
>
