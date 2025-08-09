'use client'

import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons'
import { EC3Product } from '@/lib/services/ec3-service'

interface EC3ProductCardProps {
  product: EC3Product
  isFavorite: boolean
  isSelectable: boolean
  onSelect: (productId: string) => void
  onToggleFavorite: (productId: string) => void
}

export function EC3ProductCard({
  product,
  isFavorite,
  isSelectable,
  onSelect,
  onToggleFavorite,
}: EC3ProductCardProps) {
  return (
    <div
      className={`p-4 transition-colors ${
        isSelectable ? 'hover:bg-primary/5 cursor-pointer' : 'opacity-75'
      }`}
      onClick={() => {
        if (isSelectable) {
          onSelect(product.id)
        }
      }}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{product.name}</h3>
            <button
              className="p-1 hover:bg-secondary/20 rounded shrink-0"
              onClick={e => {
                e.stopPropagation()
                onToggleFavorite(product.id)
              }}>
              {isFavorite ? (
                <StarFilledIcon className="w-4 h-4 text-yellow-400" />
              ) : (
                <StarIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="mt-1 space-y-1">
            <p className="text-sm text-muted-foreground">Manufacturer: {product.manufacturer}</p>
            <p className="text-sm text-muted-foreground">Category: {product.category}</p>
            {product.gwp && (
              <p className="text-sm text-muted-foreground">
                GWP: {product.gwp} kg CO₂-eq/{product.declaredUnit}
              </p>
            )}
            {product.ubp && (
              <p className="text-sm text-muted-foreground">
                UBP: {product.ubp} /{product.declaredUnit}
              </p>
            )}
            {product.penre && (
              <p className="text-sm text-muted-foreground">
                PENRE: {product.penre} MJ/{product.declaredUnit}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
