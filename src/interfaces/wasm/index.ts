export interface WASMElement {
  id: string
  type: string
  object_type: string
  properties: {
    name?: string
    level?: string
    loadBearing?: boolean
    isExternal?: boolean
  }
  volume?: number
  area?: number
  materials?: string[]
  material_volumes?: {
    [key: string]: {
      volume: number
      fraction: number
    }
  }
}

export interface ElementDebug {
  id: string
  type: string
  has_associations: boolean
  materials_found: number
  material_volumes_found: number
  materials: string[]
  material_volumes: { [key: string]: { volume: number; fraction: number } }
  material_type?: string
  constituent_count?: number
  layer_count?: number
  layer_set_type?: string
}

export interface WASMParseResult {
  elements: WASMElement[]
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
