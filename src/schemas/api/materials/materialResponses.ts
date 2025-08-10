import { DefaultResponse } from '@/interfaces/DefaultResponse'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'

export type EC3MatchData = Omit<IEC3Match, '_id' | 'materialId'> & { materialId: string }

// Create material types
export type CreateMaterialResponse = DefaultResponse<IMaterialDB>
export type CreateMaterialBulkResponse = DefaultResponse<IMaterialDB[]>

// Create EC3 match types
export type CreateEC3MatchResponse = DefaultResponse<EC3MatchData | null>
export type CreateEC3BulkMatchResponse = DefaultResponse<EC3MatchData[]>

// Get material types
export type GetMaterialResponse = DefaultResponse<IMaterialDB>
export type GetMaterialBulkResponse = DefaultResponse<IMaterialDB[]>

// Update material types
export type UpdateMaterialResponse = DefaultResponse<IMaterialDB>
export type UpdateMaterialBulkResponse = DefaultResponse<IMaterialDB[]>

// Delete material types
export type DeleteMaterialResponse = DefaultResponse<IMaterialDB>
