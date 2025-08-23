import { ClientSession } from 'mongoose'
import { z } from 'zod'

// ID param
export const idParamSchema = z.object({
  id: z.string().min(1),
})

// Pagination
export const paginationRequestSchema = z.object({
  size: z.number().min(1).max(50),
  page: z.number().min(1),
})
export const paginationResponseSchema = z.object({
  size: z.number().min(1).max(50),
  page: z.number().min(1),
  hasMore: z.boolean(),
  totalCount: z.number(),
  totalPages: z.number(),
})

// File validation schemas
export const fileValidationSchema = z.object({
  file: z.instanceof(File).refine(file => file.size > 0, 'File cannot be empty'),
})

// IFC file validation schema
export const ifcFileValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size > 0, 'File cannot be empty')
    .refine(
      file => file.size <= 100 * 1024 * 1024, // 100MB limit
      'File size must be less than 100MB'
    )
    .refine(file => {
      const validExtensions = ['.ifc', '.IFC']
      return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    }, 'File must be an IFC file (.ifc extension)')
    .refine(file => {
      const validMimeTypes = [
        'application/octet-stream',
        'text/plain',
        'model/ifc',
        'application/ifc',
      ]
      return validMimeTypes.includes(file.type) || file.type === ''
    }, 'Invalid file type. Must be an IFC file'),
})

// Image file validation schema
export const imageFileValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size > 0, 'File cannot be empty')
    .refine(
      file => file.size <= 10 * 1024 * 1024, // 10MB limit
      'File size must be less than 10MB'
    )
    .refine(file => {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    }, 'File must be an image (jpg, jpeg, png, gif, webp, svg)')
    .refine(file => {
      const validMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ]
      return validMimeTypes.includes(file.type)
    }, 'Invalid file type. Must be an image'),
})

// Generic file validation schema with configurable options
export const createFileValidationSchema = (options: {
  maxSize?: number // in bytes
  allowedExtensions?: string[]
  allowedMimeTypes?: string[]
  required?: boolean
}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedExtensions = [],
    allowedMimeTypes = [],
    required = true,
  } = options

  return z.object({
    file: z
      .instanceof(File)
      .refine(file => !required || file.size > 0, 'File cannot be empty')
      .refine(
        file => file.size <= maxSize,
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      )
      .refine(
        file => {
          if (allowedExtensions.length === 0) return true
          return allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()))
        },
        `File must have one of these extensions: ${allowedExtensions.join(', ')}`
      )
      .refine(
        file => {
          if (allowedMimeTypes.length === 0) return true
          return allowedMimeTypes.includes(file.type)
        },
        `Invalid file type. Must be one of: ${allowedMimeTypes.join(', ')}`
      ),
  })
}

// Default request schema
export const defaultRequestSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    data: schema,
    session: z.custom<ClientSession>().optional(),
  })

// Default response schema
export const defaultResponseSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: schema,
  })

// ID param
export type IdParamSchema = z.infer<typeof idParamSchema>

// Pagination
export type PaginationRequest = z.infer<typeof paginationRequestSchema>
export type PaginationResponse = z.infer<typeof paginationResponseSchema>

// File validation types
export type FileValidation = z.infer<typeof fileValidationSchema>
export type IfcFileValidation = z.infer<typeof ifcFileValidationSchema>
export type ImageFileValidation = z.infer<typeof imageFileValidationSchema>
