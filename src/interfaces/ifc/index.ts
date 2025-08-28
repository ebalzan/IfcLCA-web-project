import { Types } from 'mongoose'

export interface IFCElement {
  id: string
  type: string
  object_type: string
  properties: {
    name: string
    loadBearing: boolean
    isExternal: boolean
  }
  volume: number
  materials: string[]
  material_volumes: { [key: string]: { volume: number; fraction: number }[] }
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

export interface ElementDebug {
  id: string
  type: string
  has_associations: boolean
  materials_found: number
  material_volumes_found: number
  materials: string[]
  material_volumes: { [key: string]: { volume: number; fraction: number }[] }
}

export interface WasmParseResult {
  elements: IFCElement[]
  debug: ElementDebug[]
  total_elements: number
  total_materials_found: number
  total_material_volumes_found: number
}

export interface Pyodide {
  loadPackage: (packages: string[]) => Promise<void>
  pyimport: (name: string) => any
  globals: { set: (name: string, value: unknown) => void }
  runPythonAsync: (code: string) => Promise<string>
}
