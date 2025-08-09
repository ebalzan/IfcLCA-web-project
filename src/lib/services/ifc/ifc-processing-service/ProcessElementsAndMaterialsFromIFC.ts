import { Types } from 'mongoose'
import { IFCElement } from '@/interfaces/ifc'

export interface ProcessElementsAndMaterialsFromIFCProps {
  projectId: Types.ObjectId
  elements: IFCElement[]
  uploadId: Types.ObjectId
}
