import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
import IElementClient from '../elements/IElementClient'

interface IMaterialNewAttributesFromEC3 extends Partial<ILCAIndicators> {
  category?: string
  density?: number
  ec3MatchId?: IEC3Material
  lastCalculated?: Date
}

interface IMaterialClient extends IMaterialVirtuals, IMaterialNewAttributesFromEC3 {
  _id: string
  name: string
  projectId: string
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: IElementClient[]
}

export default IMaterialClient
