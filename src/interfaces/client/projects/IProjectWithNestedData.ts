import { IElementVirtuals } from '@/interfaces/elements/IElementDB'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
import { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'
import { IProjectClient } from './IProjectClient'
import { IElementClient } from '../elements/IElementClient'
import { IMaterialClient } from '../materials/IMaterialClient'
import { IUploadClient } from '../uploads/IUploadClient'

export interface IElementWithMaterialRefsClient extends IElementClient, IElementVirtuals {
  materialRefs: (IMaterialClient & IMaterialVirtuals)[]
}

export interface IProjectWithNestedDataClient extends IProjectClient {
  elements: IElementWithMaterialRefsClient[]
  materials: (IMaterialClient & IMaterialVirtuals)[]
  uploads: IUploadClient[]
  totalIndicators: ILCAIndicators
  _count: {
    elements: number
    uploads: number
    materials: number
  }
}
