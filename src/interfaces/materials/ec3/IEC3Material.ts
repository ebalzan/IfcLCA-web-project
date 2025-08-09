export interface IEC3Material {
  id: string
  name: string
  manufacturer: string
  category: string | null
  description: string | null
  gwp: number | null // Global Warming Potential (kg CO2-eq)
  ubp: number | null // Environmental Damage Points
  penre: number | null // Primary Energy Non-Renewable (MJ)
  unit: string | null
  density: number | null
  declaredUnit: string | null
  validFrom: string | null
  validTo: string | null
  'kg/unit': number | null
  'min density': number | null
  'max density': number | null
}
