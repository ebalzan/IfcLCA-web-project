import {
  CalculateElementIndicatorsRequest,
  CalculateElementIndicatorsResponse,
} from '@/schemas/utils/calculateLCAIndicators'

export async function calculateElementIndicators({
  data: { volume, density, ec3Material },
}: CalculateElementIndicatorsRequest): Promise<CalculateElementIndicatorsResponse> {
  if (!ec3Material || !density || density <= 0 || !volume || isNaN(volume)) {
    return {
      gwp: 0,
      ubp: 0,
      penre: 0,
    }
  }

  if (
    typeof ec3Material.gwp !== 'number' ||
    typeof ec3Material.ubp !== 'number' ||
    typeof ec3Material.penre !== 'number'
  ) {
    return {
      gwp: 0,
      ubp: 0,
      penre: 0,
    }
  }

  const mass = volume * density

  return {
    gwp: mass * ec3Material.gwp,
    ubp: mass * ec3Material.ubp,
    penre: mass * ec3Material.penre,
  }
}
