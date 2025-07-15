interface IMaterialChange {
  materialId: string
  materialName: string
  oldKbobMatchId?: string
  newKbobMatchId: string
  oldDensity?: number
  newDensity: number
  affectedElements: number
  projects: string[]
}

export default IMaterialChange
