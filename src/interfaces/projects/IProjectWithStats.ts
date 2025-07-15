import IProjectDB from "./IProjectDB"
import IUploadDB from "../uploads/IUploadDB"
import IElementDB, { IElementVirtuals } from "../elements/IElementDB"
import IMaterialDB from "../materials/IMaterialDB"
import ILCAIndicators from "../materials/ILCAIndicators"

export interface IElementWithMaterialRefs extends IElementDB, IElementVirtuals {
  materialRefs: IMaterialDB[]
}

interface IProjectWithStats extends IProjectDB {
  elements: IElementWithMaterialRefs[]
  materials: IMaterialDB[]
  uploads: IUploadDB[]
  totalEmissions: ILCAIndicators
  lastActivityAt: Date
  _count: {
    elements: number
    uploads: number
    materials: number
  }
}

export default IProjectWithStats
