import { useMemo } from 'react'
import IElementClient from '@/interfaces/client/elements/IElementClient'
import IMaterialLayerClient from '@/interfaces/client/elements/IMaterialLayerClient'
import IProjectWithStatsClient from '@/interfaces/client/projects/IProjectWithStatsClient'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'

export interface ProjectEmissions {
  totals: {
    gwp: number
    ubp: number
    penre: number
  }
  formatted: {
    gwp: string
    ubp: string
    penre: string
  }
  units: {
    gwp: string
    ubp: string
    penre: string
  }
}

const defaultEmissions: ProjectEmissions = {
  totals: { gwp: 0, ubp: 0, penre: 0 },
  formatted: {
    gwp: '0',
    ubp: '0',
    penre: '0',
  },
  units: {
    gwp: 'kg CO₂ eq',
    ubp: 'UBP',
    penre: 'kWh oil-eq',
  },
}

const MILLION = 1_000_000

export function useProjectEmissions(project?: IProjectWithStatsClient): ProjectEmissions {
  return useMemo(() => {
    if (!project?.elements) {
      return defaultEmissions
    }

    // Calculate totals from elements
    const totals = project.elements.reduce<ILCAIndicators>(
      (acc: ILCAIndicators, element: IElementClient) => {
        if (!element?.materials?.length) return acc

        element.materials.forEach((materialLayer: IMaterialLayerClient) => {
          const volume = materialLayer.volume || 0
          const density = materialLayer.material?.density || 0
          const kbob = materialLayer.material?.kbobMatch

          acc.gwp += volume * density * (kbob?.gwp || 0)
          acc.ubp += volume * density * (kbob?.ubp || 0)
          acc.penre += volume * density * (kbob?.penre || 0)
        })
        return acc
      },
      { gwp: 0, ubp: 0, penre: 0 }
    )

    // Format numbers consistently
    const formatted = Object.entries(totals).reduce(
      (acc: ProjectEmissions['formatted'], [key, value]) => ({
        ...acc,
        [key]:
          value >= MILLION
            ? `${(value / MILLION).toLocaleString('de-CH', {
                maximumFractionDigits: 3,
                minimumFractionDigits: 1,
              })} Mio.`
            : value.toLocaleString('de-CH', {
                maximumFractionDigits: 0,
              }),
      }),
      {} as ProjectEmissions['formatted']
    )

    return {
      totals,
      formatted,
      units: defaultEmissions.units,
    }
  }, [project])
}
