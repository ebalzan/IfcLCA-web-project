import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
import IOpenEPDProduct from '@/interfaces/materials/IOpenEPDProduct'
import IElementClient from '../elements/IElementClient'

interface IMaterialNewAttributesFromEPD extends Partial<ILCAIndicators> {
  category?: string
  density?: number
  openEPDMatch?: IOpenEPDProduct
  lastCalculated?: Date
}

interface IMaterialClient extends IMaterialVirtuals, IMaterialNewAttributesFromEPD {
  _id: string
  name: string
  projectId: string
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: IElementClient[]
}

export default IMaterialClient
