'use client'

import { useMemo } from 'react'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMaterialsLibraryStore } from '@/hooks/materials/materials-library/materials-library-store'
import IMaterialChange from '@/interfaces/materials/IMaterialChange'

interface MaterialChangesPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (changesWithDensity: IMaterialChange[]) => void
  onNavigateToProject?: (projectId: string) => void
  changes: IMaterialChange[]
  isLoading?: boolean
}

export function MaterialChangesPreviewModal({
  changes,
  isOpen,
  onClose,
  onConfirm,
  onNavigateToProject,
  isLoading = false,
}: MaterialChangesPreviewModalProps) {
  const { previewChanges, setPreviewChanges } = useMaterialsLibraryStore()

  const handleDensityChange = (materialId: string, newValue: number[]) => {
    setPreviewChanges(
      previewChanges.map(change =>
        change.materialId.toString() === materialId
          ? { ...change, newDensity: newValue[0] }
          : change
      )
    )
  }

  const handleConfirm = () => {
    onConfirm(previewChanges)
  }

  // Check if all materials are from the same project
  const singleProjectId = useMemo(() => {
    if (!changes.length) return null

    // Get all unique project IDs
    const uniqueProjectIds = new Set<string>()
    changes.forEach(change => {
      if (change.projects) {
        change.projects.forEach(projectId => {
          uniqueProjectIds.add(projectId.toString())
        })
      }
    })

    // Return the project ID if there's exactly one, otherwise null
    return uniqueProjectIds.size === 1 ? Array.from(uniqueProjectIds)[0] : null
  }, [changes])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Material Changes</DialogTitle>
          <DialogDescription>
            Review the changes that will be applied to your materials
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>KBOB Match</TableHead>
                <TableHead>Density (kg/m³)</TableHead>
                <TableHead>Affected Elements</TableHead>
                <TableHead>Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewChanges.map(change => (
                <TableRow key={change.materialId.toString()}>
                  <TableCell>{change.materialName}</TableCell>
                  <TableCell>
                    {change.oldEC3Match && (
                      <div className="line-through text-muted-foreground">
                        {change.oldEC3Match.name}
                      </div>
                    )}
                    <div className="text-green-600">{change.newEC3Match?.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {change.oldEC3Match && (
                        <div className="line-through text-muted-foreground">
                          {change.oldDensity?.toFixed(0)} kg/m³
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">{change.newDensity.toFixed(0)} kg/m³</span>
                      </div>
                      {change.newEC3Match &&
                        change.newEC3Match['min density'] !== undefined &&
                        change.newEC3Match['max density'] !== undefined && (
                          <>
                            <Slider
                              value={[change.newDensity]}
                              min={change.newEC3Match['min density']}
                              max={change.newEC3Match['max density']}
                              step={1}
                              onValueChange={value =>
                                handleDensityChange(change.materialId.toString(), value)
                              }
                              className="w-[120px]"
                            />
                            <div className="text-xs text-muted-foreground">
                              Range: {change.newEC3Match['min density'].toFixed(0)} -{' '}
                              {change.newEC3Match['max density'].toFixed(0)} kg/m³
                            </div>
                          </>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>{change.affectedElements}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">{change.projects.join(', ')}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isLoading ? (
            <Button disabled>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Applying Changes...
            </Button>
          ) : singleProjectId && onNavigateToProject ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 pr-3">
                  <span>Confirm Changes</span>
                  <div className="h-4 w-[1px] bg-white/20" />
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    handleConfirm()
                    onNavigateToProject(singleProjectId)
                  }}>
                  Go to Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleConfirm}>Return to Library</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleConfirm}>Confirm Changes</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
