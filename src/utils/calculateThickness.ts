import { IFCElement } from '@/interfaces/ifc'

export function calculateThickness(element: IFCElement): number {
  const totalThickness = element.materialLayers?.layers.reduce(
    (sum, layer) => sum + (layer.volume || 0),
    0
  )

  return totalThickness ?? 0
}
