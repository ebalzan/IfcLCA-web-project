import { IElementVirtuals } from '@/interfaces/elements/IElementDB'
import IMaterialLayerClient from './IMaterialLayerClient'

export interface IElementWithVirtuals extends IElementClient, IElementVirtuals {}

interface IElementClient {
  _id: string
  guid: string
  projectId: string
  isExternal: boolean
  loadBearing: boolean
  materials: IMaterialLayerClient[]
  name: string
  type: string
  createdAt: Date
  updatedAt: Date
}

export default IElementClient
