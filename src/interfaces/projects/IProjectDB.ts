import { Types } from 'mongoose'
import ILCAIndicators from '../materials/ILCAIndicators'

interface IProjectDB {
  _id: Types.ObjectId
  name: string
  description?: string
  userId: string
  imageUrl?: string
  emissions: ILCAIndicators & { lastCalculated?: Date }
  createdAt: Date
  updatedAt: Date
}

export default IProjectDB
