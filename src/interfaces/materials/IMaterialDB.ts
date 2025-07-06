import { Types } from "mongoose"
import ILCAIndicators from "./ILCAIndicators"

interface IMaterialNewAttributesFromKBOB extends Partial<ILCAIndicators> {
  category?: string
  density?: number
  kbobMatchId?: Types.ObjectId
  lastCalculated?: Date
}

interface IMaterialDB extends IMaterialNewAttributesFromKBOB {
  _id: Types.ObjectId
  name: string
  projectId: Types.ObjectId
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: Types.ObjectId[]
}

export default IMaterialDB