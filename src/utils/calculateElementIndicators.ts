import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { Element } from '@/models'
import {
  CalculateElementIndicatorsRequest,
  CalculateElementIndicatorsResponse,
} from '@/schemas/utils/calculateLCAIndicators'

export async function calculateElementIndicators({
  data: { elementId },
}: CalculateElementIndicatorsRequest): Promise<CalculateElementIndicatorsResponse> {
  const element = await Element.findById(elementId)
    .populate<{
      materials: { material: IMaterialDB; volume: number; fraction: number; thickness: number }[]
    }>('materials')
    .lean()

  if (!element) {
    throw new Error('Element not found')
  }

  const indicators = element.materials.reduce(
    (acc, materialLayer) => {
      const material = materialLayer.material

      if (!material?.ec3MatchId) return acc

      const volume = materialLayer.volume || 0
      const density = material.density || 0
      const mass = volume * density

      return {
        gwp: acc.gwp + mass * (material.gwp || 0),
        ubp: acc.ubp + mass * (material.ubp || 0),
        penre: acc.penre + mass * (material.penre || 0),
      }
    },
    { gwp: 0, ubp: 0, penre: 0 }
  )

  return {
    success: true,
    message: 'LCA indicators calculated successfully',
    data: indicators,
  }
}
