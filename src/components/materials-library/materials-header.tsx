'use client'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface MaterialsHeaderProps {
  materialsCount: number
  matchingProgress: {
    totalMaterials: number
    matchedCount: number
    percentage: number
  }
  searchValue: string
  onSearchChange: (value: string) => void
  onPreviewChanges: () => void
  unappliedMatchesCount: number
}

export function MaterialsHeader({
  materialsCount,
  matchingProgress,
  searchValue,
  onSearchChange,
  onPreviewChanges,
  unappliedMatchesCount,
}: MaterialsHeaderProps) {
  return (
    <div className="p-4 border-b bg-secondary/10 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <span>IFC Materials</span>
          {materialsCount > 0 && (
            <Badge variant="secondary" className="animate-in fade-in">
              {materialsCount} selected
            </Badge>
          )}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-24 h-2 bg-secondary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${matchingProgress.percentage}%`,
                  }}
                />
              </div>
              <Badge
                variant={matchingProgress.percentage === 100 ? 'success' : 'secondary'}
                className="text-xs">
                {matchingProgress.matchedCount}/{matchingProgress.totalMaterials}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {materialsCount > 0
          ? `Select an OpenEPD material to match with ${materialsCount} selected materials`
          : 'Select materials from the left to match them with OpenEPD materials'}
      </p>

      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search model materials..."
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  )
}
