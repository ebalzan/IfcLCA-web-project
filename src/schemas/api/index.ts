import { z } from 'zod'

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid ObjectId format',
})

export const paginationSchema = z.object({
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1, 'Page must be at least 1'))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'))
    .optional()
    .default('10'),
})

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

export const projectIdSchema = z.object({
  id: objectIdSchema,
})

export const createUploadSchema = z.object({
  filename: z
    .string()
    .min(1, {
      message: 'Filename is required',
    })
    .max(255, {
      message: 'Filename cannot exceed 255 characters',
    }),
})

export const uploadIdSchema = z.object({
  id: objectIdSchema,
})

export const materialIdSchema = z.object({
  id: objectIdSchema,
})

export const matchMaterialSchema = z.object({
  kbobMatchId: objectIdSchema,
})

export const matchMaterialsToKBOBSchema = z.object({
  materialIds: z.array(objectIdSchema).min(1, {
    message: 'At least one material ID is required',
  }),
  kbobMaterialId: objectIdSchema,
  density: z
    .number()
    .positive({
      message: 'Density must be a positive number',
    })
    .optional(),
})

export const matchOpenEPDSchema = z.object({
  materialIds: z.array(objectIdSchema).min(1, {
    message: 'At least one material ID is required',
  }),
  openEPDProductId: z.string().min(1, {
    message: 'OpenEPD product ID is required',
  }),
  density: z
    .number()
    .positive({
      message: 'Density must be a positive number',
    })
    .optional(),
})

export const checkMatchesSchema = z.object({
  materialNames: z
    .array(
      z.string().min(1, {
        message: 'Material name cannot be empty',
      })
    )
    .min(1, {
      message: 'At least one material name is required',
    }),
  projectId: objectIdSchema,
})

export const getKBOBMatchPreviewSchema = z.object({
  materialIds: z.array(objectIdSchema).min(1, {
    message: 'At least one material ID is required',
  }),
  kbobMaterialId: objectIdSchema,
})

export const ifcMaterialSchema = z.object({
  name: z.string().min(1, {
    message: 'Material name is required',
  }),
  volume: z.number().nonnegative({
    message: 'Volume must be non-negative',
  }),
})

export const ifcMaterialLayerSchema = z.object({
  layers: z.array(ifcMaterialSchema),
})

export const ifcElementSchema = z.object({
  globalId: z.string().min(1, {
    message: 'Global ID is required',
  }),
  type: z.string().min(1, {
    message: 'Element type is required',
  }),
  name: z.string().min(1, {
    message: 'Element name is required',
  }),
  volume: z.number().nonnegative({
    message: 'Volume must be non-negative',
  }),
  properties: z
    .object({
      loadBearing: z.boolean().optional(),
      isExternal: z.boolean().optional(),
    })
    .optional(),
  materials: z.array(ifcMaterialSchema).optional(),
  materialLayers: z.array(ifcMaterialLayerSchema).optional(),
})

export const processUploadSchema = z.object({
  uploadId: objectIdSchema,
  elements: z.array(ifcElementSchema).min(1, {
    message: 'At least one element is required',
  }),
})

export const projectSearchSchema = z.object({
  q: z.string().optional(),
  all: z
    .string()
    .transform(val => val === 'true')
    .optional(),
})

export const acceptTermsSchema = z.object({})

export const activityFeedSchema = paginationSchema

export const emissionsSchema = z.object({})

export const kbobSchema = z.object({})

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, {
      message: 'File is required',
    })
    .refine(
      file => file.size <= 50 * 1024 * 1024, // 50MB limit
      {
        message: 'File size must be less than 50MB',
      }
    )
    .refine(file => file.type === 'application/octet-stream' || file.name?.endsWith('.ifc'), {
      message: 'File must be an IFC file',
    }),
})

export type CreateProjectRequest = z.infer<typeof createProjectSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>
export type ProjectSearchRequest = z.infer<typeof projectSearchSchema>
export type PaginationRequest = z.infer<typeof paginationSchema>

export type MatchMaterialRequest = z.infer<typeof matchMaterialSchema>
export type MatchMaterialsToKBOBRequest = z.infer<typeof matchMaterialsToKBOBSchema>
export type MatchOpenEPDRequest = z.infer<typeof matchOpenEPDSchema>
export type CheckMatchesRequest = z.infer<typeof checkMatchesSchema>
export type GetKBOBMatchPreviewRequest = z.infer<typeof getKBOBMatchPreviewSchema>
export type IFCElement = z.infer<typeof ifcElementSchema>

export type CreateUploadRequest = z.infer<typeof createUploadSchema>
export type ProcessUploadRequest = z.infer<typeof processUploadSchema>
export type FileUploadRequest = z.infer<typeof fileUploadSchema>
export type ActivityFeedRequest = z.infer<typeof activityFeedSchema>
