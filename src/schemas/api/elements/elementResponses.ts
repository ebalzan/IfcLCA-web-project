import { DefaultResponse } from '@/interfaces/DefaultResponse'
import { IElementDB } from '@/interfaces/elements/IElementDB'

// Create element types
export type CreateElementResponse = DefaultResponse<IElementDB>
export type CreateElementBulkResponse = DefaultResponse<IElementDB[]>

// Update element types
export type UpdateElementResponse = DefaultResponse<IElementDB>
export type UpdateElementBulkResponse = DefaultResponse<IElementDB[]>

// Delete element types
export type DeleteElementResponse = DefaultResponse<IElementDB>
