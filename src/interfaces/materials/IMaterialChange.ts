import IOpenEPDProduct from './IOpenEPDProduct'

interface IMaterialChange {
  materialId: string
  materialName: string
  oldOpenEPDMatch?: IOpenEPDProduct
  newOpenEPDMatch?: IOpenEPDProduct
  oldDensity?: number
  newDensity: number
  affectedElements: number
  projects: string[]
}

export default IMaterialChange
