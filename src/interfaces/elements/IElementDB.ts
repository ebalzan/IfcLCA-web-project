import { Types } from 'mongoose'
import { IMaterialLayer } from './IMaterialLayer'
import ILCAIndicators from '../materials/ILCAIndicators'

export interface IElementVirtuals {
  totalVolume: number
  indicators: ILCAIndicators
}

export interface IElementDB {
  _id: Types.ObjectId
  projectId: Types.ObjectId
  guid: string
  name: string
  type: string
  loadBearing: boolean
  isExternal: boolean
  materials: IMaterialLayer[]
  createdAt: Date
  updatedAt: Date
}
