import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Project name must be at least 2 characters',
    })
    .max(100, {
      message: 'Project name cannot exceed 100 characters',
    }),
  description: z
    .string()
    .max(500, {
      message: 'Description cannot exceed 500 characters',
    })
    .optional(),
  imageUrl: z
    .string()
    .url({
      message: 'Invalid image URL format',
    })
    .optional(),
})

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Project name must be at least 2 characters',
    })
    .max(100, {
      message: 'Project name cannot exceed 100 characters',
    }),
  description: z
    .string()
    .max(500, {
      message: 'Description cannot exceed 500 characters',
    })
    .optional(),
})

export type CreateProjectSchema = z.infer<typeof createProjectSchema>
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>
