import { z } from "zod";

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Project name must be at least 2 characters." }),
  description: z.string().optional(),
});

export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
