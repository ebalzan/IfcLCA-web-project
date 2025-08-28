export interface IEC3Material {
  id: string
  name: string
  category: {
    id: string
    name: string
    description: string | null
    declaredUnit: string | null
  } | null
  gwp: number | null // Global Warming Potential (kg CO2-eq)
  ubp: number | null // Environmental Damage Points
  penre: number | null // Primary Energy Non-Renewable (MJ)
  density: number | null
  declaredUnit: string | null
}
