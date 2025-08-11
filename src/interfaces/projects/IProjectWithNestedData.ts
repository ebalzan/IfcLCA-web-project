import IProjectDB from './IProjectDB'
import { IElementDB, IElementVirtuals } from '../elements/IElementDB'
import ILCAIndicators from '../materials/ILCAIndicators'
import IMaterialDB from '../materials/IMaterialDB'
import IUploadDB from '../uploads/IUploadDB'

export interface IElementWithMaterialRefs extends IElementDB, IElementVirtuals {
  materialRefs: IMaterialDB[]
}

export interface IProjectWithNestedData extends IProjectDB {
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
