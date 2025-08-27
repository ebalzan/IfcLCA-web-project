import { z } from 'zod'

export const createProjectFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

export const updateProjectFormSchema = z
  .object({
    name: z.string(),
    description: z.string(),
  })
  .partial()

export type CreateProjectFormSchema = z.infer<typeof createProjectFormSchema>
export type UpdateProjectFormSchema = z.infer<typeof updateProjectFormSchema>
