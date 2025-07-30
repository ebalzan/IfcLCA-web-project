import IOpenEPDProduct from './IOpenEPDProduct'

interface IMaterialChange {
  materialId: string
  materialName: string
  oldOpenepdMatch?: IOpenEPDProduct
  newOpenepdMatch?: IOpenEPDProduct
  oldDensity?: number
  newDensity: number
  affectedElements: number
  projects: string[]
}

export default IMaterialChange
