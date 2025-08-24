'use client'

import { EC3CardItemProps } from './EC3CardItemProps'

export function EC3CardItem({ material, isSelectable, onSelect }: EC3CardItemProps) {
  return (
    <div
      className={`p-4 transition-colors ${
        isSelectable ? 'hover:bg-primary/5 cursor-pointer' : 'opacity-75'
      }`}
      onClick={() => {
        if (isSelectable) {
          onSelect(material.id)
        }
      }}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{material.name}</h3>
          </div>

          <div className="mt-1 space-y-1">
            <p className="text-sm text-muted-foreground">Manufacturer: {material.manufacturer}</p>
            <p className="text-sm text-muted-foreground">Category: {material.category}</p>
            {material.gwp && (
              <p className="text-sm text-muted-foreground">
                GWP: {material.gwp} kg CO₂-eq/{material.declaredUnit}
              </p>
            )}
            {material.ubp && (
              <p className="text-sm text-muted-foreground">
                UBP: {material.ubp} /{material.declaredUnit}
              </p>
            )}
            {material.penre && (
              <p className="text-sm text-muted-foreground">
                PENRE: {material.penre} MJ/{material.declaredUnit}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
