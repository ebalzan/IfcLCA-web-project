import { Types } from 'mongoose'
import { IEC3Material } from './ec3/IEC3Material'

interface IMaterialChange {
  materialId: Types.ObjectId
  materialName: string
  oldEC3Match?: IEC3Material
  newEC3Match?: IEC3Material
  oldDensity?: number
  newDensity: number
  affectedElements: number
  projects: Types.ObjectId[]
}

export default IMaterialChange
