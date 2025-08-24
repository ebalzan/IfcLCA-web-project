'use client'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { IFCCardHeaderProps } from './IFCCardHeaderProps'

export function IFCCardHeader({
  materialsCount,
  matchingProgress,
  searchValue,
  onSearchChange,
}: IFCCardHeaderProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <span>IFC Materials</span>
          {matchingProgress.matchedCount > 0 && (
            <Badge variant="secondary" className="animate-in fade-in">
              {matchingProgress.matchedCount} matched
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
                {matchingProgress.matchedCount}/{materialsCount}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-2">
        {materialsCount > 0
          ? `Select an EC3 material to match with ${materialsCount} selected materials`
          : 'Select materials from the left to match them with EC3 materials'}
      </p>

      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search IFC materials"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  )
}
