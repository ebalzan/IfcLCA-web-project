import { Types } from 'mongoose'
import { IEC3Material } from './IEC3Material'

interface IMaterialDB extends Partial<Omit<IEC3Material, 'id' | 'name'>> {
  _id: Types.ObjectId
  name: string
  projectId: Types.ObjectId
  ec3MatchId: string | null
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: Types.ObjectId[]
}

export default IMaterialDB
