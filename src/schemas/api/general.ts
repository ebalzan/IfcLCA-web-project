import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export type IdParamSchema = z.infer<typeof idParamSchema>
