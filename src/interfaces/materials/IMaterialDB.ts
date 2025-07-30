import { Types } from 'mongoose'
import ILCAIndicators from './ILCAIndicators'

interface IMaterialNewAttributesFromEPD extends Partial<ILCAIndicators> {
  category?: string
  density?: number
  openepdMatchId?: Types.ObjectId
  lastCalculated?: Date
}

interface IMaterialDB extends IMaterialNewAttributesFromEPD {
  _id: Types.ObjectId
  name: string
  projectId: Types.ObjectId
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: Types.ObjectId[]
}

export default IMaterialDB
