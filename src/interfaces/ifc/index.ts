export interface IFCElement {
  guid: string
  name: string
  type: string
  volume: number
  buildingStorey?: string
  properties: {
    loadBearing: boolean
    isExternal: boolean
  }
  materials: IFCMaterial[]
  materialLayers: { layers: IFCMaterial[] }[]
}

export interface IFCMaterial {
  name: string
  volume: number
  fraction: number
}

export interface IFCParseResult {
  elements: IFCElement[]
  error?: string
  elementCount?: number
  uploadId?: string
  materialCount?: number
  unmatchedMaterialCount?: number
  shouldRedirectToLibrary?: boolean
}
