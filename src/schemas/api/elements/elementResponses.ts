import { DefaultResponse } from '@/interfaces/DefaultResponse'
import { IElementDB } from '@/interfaces/elements/IElementDB'

// Create element types
export type CreateElementResponse = DefaultResponse<IElementDB>
export type CreateElementBulkResponse = DefaultResponse<IElementDB[]>

// Get element types
export type GetElementResponse = DefaultResponse<IElementDB>
export type GetElementBulkResponse = DefaultResponse<IElementDB[]>

// Update element types
export type UpdateElementResponse = DefaultResponse<IElementDB>
export type UpdateElementBulkResponse = DefaultResponse<IElementDB[]>

// Delete element types
export type DeleteElementResponse = DefaultResponse<IElementDB>
export type DeleteElementBulkResponse = DefaultResponse<IElementDB[]>
