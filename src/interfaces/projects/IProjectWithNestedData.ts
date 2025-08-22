import IProjectDB from './IProjectDB'
import { IElementDB, IElementVirtuals } from '../elements/IElementDB'
import ILCAIndicators from '../materials/ILCAIndicators'
import IMaterialDB, { IMaterialVirtuals } from '../materials/IMaterialDB'
import IUploadDB from '../uploads/IUploadDB'

export interface IElementWithMaterialRefs extends IElementDB, IElementVirtuals {
  materialRefs: (IMaterialDB & IMaterialVirtuals)[]
}

export interface IProjectWithNestedData extends IProjectDB {
  elements: IElementWithMaterialRefs[]
  materials: (IMaterialDB & IMaterialVirtuals)[]
  uploads: IUploadDB[]
  totalIndicators: ILCAIndicators
  _count: {
    elements: number
    uploads: number
    materials: number
  }
}
