import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  description: z.string().optional(),
})

export type CreateProjectSchema = z.infer<typeof createProjectSchema>
