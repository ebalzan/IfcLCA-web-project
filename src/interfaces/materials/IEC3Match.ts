import { Types } from 'mongoose'

export interface IEC3Match {
  _id: Types.ObjectId
  ec3MatchId: string
  materialId: Types.ObjectId
  autoMatched: boolean | null
  score?: number
}
