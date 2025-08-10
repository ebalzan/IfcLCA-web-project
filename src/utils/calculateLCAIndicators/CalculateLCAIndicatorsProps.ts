import { Types } from 'mongoose'
import { DefaultRequest } from '@/interfaces/DefaultRequest'
import { DefaultResponse } from '@/interfaces/DefaultResponse'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'

export type CalculateLCAIndicatorsRequest = DefaultRequest<{
  volume: number
  density: number
  materialId: Types.ObjectId
  ec3MatchId?: string
}>

export type CalculateLCAIndicatorsResponse = DefaultResponse<ILCAIndicators>
