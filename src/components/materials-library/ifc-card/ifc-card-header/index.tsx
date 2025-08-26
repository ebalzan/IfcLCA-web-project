'use client'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IFCCardHeaderProps } from './IFCCardHeaderProps'

export function IFCCardHeader({
  materialsCount,
  materialsSelectedCount,
  matchingProgress,
  searchValue,
  onSearchChange,
  isSelectAllChecked,
  onSelectAllCheckedChange,
}: IFCCardHeaderProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <span>IFC Materials</span>
          {materialsSelectedCount > 0 && (
            <Badge variant="secondary" className="animate-in fade-in">
              {materialsSelectedCount} selected
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

      <div className="flex items-center gap-2 mb-2">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search IFC materials"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="select-all"
          checked={isSelectAllChecked}
          onCheckedChange={onSelectAllCheckedChange}
        />
        <Label htmlFor="select-all">Select all</Label>
      </div>
    </div>
  )
}
