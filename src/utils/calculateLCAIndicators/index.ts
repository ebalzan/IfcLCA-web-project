import { MaterialService } from '@/lib/services/material-service'
import {
  CalculateLCAIndicatorsRequest,
  CalculateLCAIndicatorsResponse,
} from './CalculateLCAIndicatorsProps'

export async function calculateLCAIndicators({
  data: { volume, density, materialId, ec3MatchId },
}: CalculateLCAIndicatorsRequest): Promise<CalculateLCAIndicatorsResponse> {
  const mass = volume * density

  const material = await MaterialService.getMaterial({
    data: { materialId, ec3MatchId },
  })

  return {
    success: true,
    message: 'LCA indicators calculated successfully',
    data: {
      gwp: mass * (material.data.gwp ?? 0),
      ubp: mass * (material.data.ubp ?? 0),
      penre: mass * (material.data.penre ?? 0),
    },
  }
}
