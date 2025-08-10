import { Types } from 'mongoose'
import { z } from 'zod'
import { DefaultRequest } from '@/interfaces/DefaultRequest'
import { DefaultResponse } from '@/interfaces/DefaultResponse'
import { IFCElement } from '@/interfaces/ifc'

// Apply automatic material matches
export const applyAutomaticMaterialMatchesRequestSchema = z.object({
  materialIds: z.array(z.custom<Types.ObjectId>()).min(1, 'At least one material ID is required'),
  projectId: z.custom<Types.ObjectId>(),
})
export const applyAutomaticMaterialMatchesResponseSchema = z.object({
  matchedCount: z.number(),
})

// Process elements and materials from IFC
export const processElementsAndMaterialsFromIFCRequestSchema = z.object({
  projectId: z.custom<Types.ObjectId>(),
  elements: z.array(z.custom<IFCElement>()),
  uploadId: z.string(),
})
export const processElementsAndMaterialsFromIFCResponseSchema = z.object({
  elementCount: z.number(),
  materialCount: z.number(),
})

// Apply automatic material matches types
export type ApplyAutomaticMaterialMatchesRequest = DefaultRequest<
  z.infer<typeof applyAutomaticMaterialMatchesRequestSchema>
>
export type ApplyAutomaticMaterialMatchesResponse = DefaultResponse<
  z.infer<typeof applyAutomaticMaterialMatchesResponseSchema>
>

// Process elements and materials from IFC types
export type ProcessElementsAndMaterialsFromIFCRequest = DefaultRequest<
  z.infer<typeof processElementsAndMaterialsFromIFCRequestSchema>
>
export type ProcessElementsAndMaterialsFromIFCResponse = DefaultResponse<
  z.infer<typeof processElementsAndMaterialsFromIFCResponseSchema>
>
