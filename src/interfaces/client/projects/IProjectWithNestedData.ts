import { IElementVirtuals } from '@/interfaces/elements/IElementDB'
import { IProjectWithNestedData } from '@/interfaces/projects/IProjectWithNestedData'
import { IElementClient } from '../elements/IElementClient'
import { IMaterialClient } from '../materials/IMaterialClient'
import { IUploadClient } from '../uploads/IUploadClient'

export interface IElementWithMaterialRefsClient extends IElementClient, IElementVirtuals {
  materialRefs: IMaterialClient[]
}

export interface IProjectWithNestedDataClient
  extends Omit<IProjectWithNestedData, 'elements' | 'materials' | 'uploads' | '_id'> {
  _id: string
  elements: IElementWithMaterialRefsClient[]
  materials: IMaterialClient[]
  uploads: IUploadClient[]
}
