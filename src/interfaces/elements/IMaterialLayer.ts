import { Types } from 'mongoose'
import ILCAIndicators from '../materials/ILCAIndicators'

export interface IMaterialLayer {
  material: Types.ObjectId
  materialName: string
  volume: number
  fraction: number | null
  thickness: number | null
  indicators: ILCAIndicators | null
}
