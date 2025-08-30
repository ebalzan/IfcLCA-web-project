import { Types } from 'mongoose'

interface IMaterialDB {
  _id: Types.ObjectId
  name: string
  projectId: Types.ObjectId
  uploadId: Types.ObjectId
  ec3MatchId: string | null
  densityMin: number | null
  densityMax: number | null
  category: string | null
  gwp: number | null
  ubp: number | null
  penre: number | null
  declaredUnit: string | null
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: Types.ObjectId[]
}

export default IMaterialDB
