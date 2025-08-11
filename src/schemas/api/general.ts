import { ClientSession } from 'mongoose'
import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const defaultRequestSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    data: schema,
    session: z.custom<ClientSession>().optional(),
  })

export const defaultResponseSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: schema,
  })

export type IdParamSchema = z.infer<typeof idParamSchema>
