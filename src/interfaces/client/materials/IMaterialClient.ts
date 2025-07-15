import ILCAIndicators from "@/interfaces/materials/ILCAIndicators"
import IKBOBMaterial from "@/interfaces/materials/IKBOBMaterial"
import IElementClient from "../elements/IElementClient"

interface IMaterialNewAttributesFromKBOB extends Partial<ILCAIndicators> {
  category?: string
  density?: number
  kbobMatch?: IKBOBMaterial
  lastCalculated?: Date
}

interface IMaterialClient extends IMaterialVirtuals, IMaterialNewAttributesFromKBOB {
  _id: string
  name: string
  projectId: string
}

export interface IMaterialVirtuals {
  totalVolume: number
  elements: IElementClient[]
}

export default IMaterialClient