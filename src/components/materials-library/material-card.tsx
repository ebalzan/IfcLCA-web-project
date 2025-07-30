'use client'

import { CheckIcon } from '@radix-ui/react-icons'
import { Trash2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import IMaterialClient from '@/interfaces/client/materials/IMaterialClient'
import { OpenEPDProduct } from '@/lib/services/openepd-service'

interface MaterialCardProps {
  material: IMaterialClient
  isSelected: boolean
  temporaryMatch: OpenEPDProduct | null
  autoSuggestedMatch: AutoSuggestedMatch | null
  onSelect: (material: IMaterialClient) => void
  onMatch: (materialId: string, openepdId: string | null) => void
  onDelete: (material: IMaterialClient) => void
  onAcceptSuggestion: (materialId: string, openepdId: string) => void
}

interface AutoSuggestedMatch {
  openepdId: string
  score: number
  name: string
}

export function MaterialCard({
  material,
  isSelected,
  temporaryMatch,
  autoSuggestedMatch,
  onSelect,
  onMatch,
  onDelete,
  onAcceptSuggestion,
}: MaterialCardProps) {
  return (
    <div
      className={`
        relative p-4 cursor-pointer
        transition-all duration-300 ease-out
        hover:bg-secondary/5 hover:scale-[1.02] hover:z-10
        group
        ${
          isSelected
            ? 'ring-2 ring-primary/50 ring-offset-1 shadow-sm bg-primary/5 z-10'
            : 'hover:ring-1 hover:ring-primary/30'
        }
        ${
          temporaryMatch
            ? 'animate-in zoom-in-95 duration-500 ease-spring slide-in-from-left-5'
            : ''
        }
        rounded-md my-2
      `}
      onClick={() => onSelect(material)}>
      {/* Match overlay */}
      {temporaryMatch && (
        <div className="absolute inset-0 bg-primary/5 animate-in fade-in duration-500 ease-spring">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 duration-300 ease-spring">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-primary animate-in zoom-in duration-300 delay-150" />
            </div>
          </div>
        </div>
      )}

      {/* Delete button */}
      <div className="absolute top-2 right-2 z-20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={e => {
                e.stopPropagation()
                onDelete(material)
              }}>
              <Trash2Icon className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Material</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-medium">{material.name}</span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(material)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Material content */}
      <div className={`flex items-start justify-between gap-4 relative z-10`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{material.name}</h3>
            {material.category && (
              <Badge variant="outline" className="shrink-0">
                {material.category}
              </Badge>
            )}
          </div>

          {material.totalVolume && (
            <p className="text-sm text-muted-foreground mt-1">
              Volume: {material.totalVolume.toFixed(2)} m³
            </p>
          )}

          {/* Match status */}
          {temporaryMatch || material.openepdMatch ? (
            <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-md">
              <div className="flex-1 min-w-0">
                {temporaryMatch ? (
                  <>
                    <p className="font-medium text-sm truncate">{temporaryMatch.name}</p>
                    <p className="text-sm text-muted-foreground">
                      GWP: {temporaryMatch.gwp} kg CO₂-eq
                    </p>
                  </>
                ) : material.openepdMatch ? (
                  <>
                    <p className="font-medium text-sm truncate">{material.openepdMatch.name}</p>
                    <p className="text-sm text-muted-foreground">
                      GWP: {material.openepdMatch.gwp} kg CO₂-eq
                    </p>
                  </>
                ) : null}
              </div>
              {temporaryMatch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={e => {
                    e.stopPropagation()
                    onMatch(material._id, null)
                  }}>
                  Clear
                </Button>
              )}
            </div>
          ) : autoSuggestedMatch ? (
            <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-yellow-500/10 rounded-md">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate text-yellow-700">
                    Suggested: {autoSuggestedMatch.name}
                  </p>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                    Auto
                  </Badge>
                </div>
                <p className="text-sm text-yellow-600">
                  Click to review and confirm this suggestion
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                onClick={e => {
                  e.stopPropagation()
                  onAcceptSuggestion(material._id, autoSuggestedMatch.openepdId)
                }}>
                Accept
              </Button>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-yellow-500/10 text-yellow-600 rounded-md text-sm">
              Click to match with OpenEPD material
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
