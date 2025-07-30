'use client'

import { MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface OpenEPDHeaderProps {
  productsCount: number
  searchTerm: string
  isSearching: boolean
  autoScrollEnabled: boolean
  onSearchTermChange: (value: string) => void
  onSearch: () => void
  onAutoScrollChange: (enabled: boolean) => void
}

export function OpenEPDHeader({
  productsCount,
  searchTerm,
  isSearching,
  autoScrollEnabled,
  onSearchTermChange,
  onSearch,
  onAutoScrollChange,
}: OpenEPDHeaderProps) {
  return (
    <div className="p-4 border-b bg-secondary/10 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <span>OpenEPD Materials Database</span>
          <Badge variant="outline">{productsCount} materials</Badge>
        </h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-scroll" className="text-sm text-muted-foreground">
            Auto-scroll
          </Label>
          <Switch
            id="auto-scroll"
            checked={autoScrollEnabled}
            onCheckedChange={onAutoScrollChange}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Search for OpenEPD products to match with your IFC materials
      </p>

      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search OpenEPD materials..."
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onSearch} disabled={isSearching || !searchTerm.trim()}>
          {isSearching ? (
            <ReloadIcon className="h-4 w-4 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
