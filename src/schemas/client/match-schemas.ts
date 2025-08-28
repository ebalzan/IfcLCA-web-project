import { z } from 'zod'

export const createMatchSchema = z.object({
  id: z.string(),
})

export type CreateMatchSchema = z.infer<typeof createMatchSchema>
