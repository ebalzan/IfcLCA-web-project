import { Types } from 'mongoose'
import { z } from 'zod'
import { IFCElement, IFCParseResult } from '@/interfaces/ifc'
import { WASMElement } from '@/interfaces/wasm'
import { defaultRequestSchema, defaultResponseSchema } from '../general'

// Apply automatic material matches request and response schemas
export const applyAutomaticMaterialMatchesRequestSchema = defaultRequestSchema(
  z.object({
    materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
    materialNames: z.array(z.string()).min(1, 'At least one material name is required').optional(),
    projectId: z.custom<Types.ObjectId>(),
  })
)
export const applyAutomaticMaterialMatchesResponseSchema = defaultResponseSchema(
  z.object({
    matchedCount: z.number(),
  })
)

// Process elements and materials from IFC request and response schemas
export const processElementsAndMaterialsFromIFCRequestSchema = defaultRequestSchema(
  z.object({
    projectId: z.custom<Types.ObjectId>(),
    elements: z.array(z.custom<IFCElement>()),
    uploadId: z.custom<Types.ObjectId>(),
  })
)
export const processElementsAndMaterialsFromIFCResponseSchema = defaultResponseSchema(
  z.object({
    elementCount: z.number(),
    materialCount: z.number(),
  })
)

// Parse IFC file request and response schemas
export const parseIFCFileRequestSchema = defaultRequestSchema(
  z.object({
    filename: z.string(),
    projectId: z.custom<Types.ObjectId>(),
    elements: z.array(z.custom<WASMElement>()),
    userId: z.string(),
  })
)
export const parseIFCFileResponseSchema = defaultResponseSchema(z.custom<IFCParseResult>())

// Apply automatic material matches request and response types
export type ApplyAutomaticMaterialMatchesRequest = z.infer<
  typeof applyAutomaticMaterialMatchesRequestSchema
>
export type ApplyAutomaticMaterialMatchesResponse = z.infer<
  typeof applyAutomaticMaterialMatchesResponseSchema
>

// Process elements and materials from IFC types
export type ProcessElementsAndMaterialsFromIFCRequest = z.infer<
  typeof processElementsAndMaterialsFromIFCRequestSchema
>
export type ProcessElementsAndMaterialsFromIFCResponse = z.infer<
  typeof processElementsAndMaterialsFromIFCResponseSchema
>

// Parse IFC file request and response types
export type ParseIFCFileRequest = z.infer<typeof parseIFCFileRequestSchema>
export type ParseIFCFileResponse = z.infer<typeof parseIFCFileResponseSchema>
