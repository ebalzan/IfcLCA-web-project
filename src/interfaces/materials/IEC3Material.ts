export interface IEC3Material {
  id: string
  name: string
  category: {
    id: string
    name: string
    description: string | null
    declaredUnit: string | null
  }
  gwp: string | null
  ubp: string | null
  penre: string | null
  densityMin: string | null
  densityMax: string | null
  declaredUnit: string | null
}
