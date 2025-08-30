import { Types } from 'mongoose'

export interface IFCMaterial {
  name: string
  volume: number
  fraction: number
}

export interface IFCElement {
  globalId: string
  type: string
  name: string
  volume: number
  properties: {
    loadBearing?: boolean
    isExternal?: boolean
  }
  materials?: IFCMaterial[]
  materialLayers?: {
    layers: Array<{
      materialName: string
      volume: number
    }>
  }
}

export interface IFCParseResult {
  uploadId: Types.ObjectId
  projectId: Types.ObjectId
  _count: {
    elements: number
    matchedMaterials: number
    unmatchedMaterials: number
  }
  shouldRedirectToLibrary: boolean
}
