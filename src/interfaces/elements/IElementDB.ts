import { Types } from 'mongoose'
import IMaterialLayer from './IMaterialLayer'
import ILCAIndicators from '../materials/ILCAIndicators'

export interface IElementVirtuals {
  totalVolume: number
  emissions: ILCAIndicators
}

interface IElementDB {
  _id: Types.ObjectId
  guid: string
  projectId: Types.ObjectId
  isExternal: boolean
  loadBearing: boolean
  materials: IMaterialLayer[]
  name: string
  type: string
  createdAt: Date
  updatedAt: Date
}

export default IElementDB
