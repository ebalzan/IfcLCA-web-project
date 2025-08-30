'use client'

import { useMemo } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMaterialsLibraryStore } from '@/hooks/materials/materials-library/materials-library-store'
import { parseDensity, parseIndicator } from '@/utils/parses'
import { transformSnakeToCamel } from '@/utils/transformers'

interface MaterialChangesPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function MaterialChangesPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: MaterialChangesPreviewModalProps) {
  const { temporaryMatches } = useMaterialsLibraryStore()

  const parsedTemporaryMatches = useMemo(() => {
    return temporaryMatches.map(match => {
      const ec3Data = transformSnakeToCamel(match.ec3MaterialData)
      // // Remove the name field to avoid duplicate key errors
      // const { name, ...ec3DataWithoutName } = ec3Data

      return {
        ...ec3Data,
        ec3MaterialName: ec3Data.name,
        category: match.ec3MaterialData.category.name,
        ec3MatchId: match.ec3MatchId,
        autoMatched: match.autoMatched,
        materialId: match.materialId,
        materialName: match.materialName,
        projectName: match.projectName,
        elementsAffectedCount: match.elementsAffectedCount,
        densityMin: ec3Data.densityMin ? parseDensity(ec3Data.densityMin) : null,
        densityMax: ec3Data.densityMax ? parseDensity(ec3Data.densityMax) : null,
        gwp: parseIndicator(ec3Data.gwp ?? ''),
        ubp: parseIndicator(ec3Data.ubp ?? ''),
        penre: parseIndicator(ec3Data.penre ?? ''),
        declaredUnit: ec3Data.declaredUnit,
      }
    })
  }, [temporaryMatches])

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
                <TableHead>EC3 Match</TableHead>
                <TableHead>Density (kg/m³)</TableHead>
                <TableHead>Affected Elements</TableHead>
                <TableHead>Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedTemporaryMatches.map(match => (
                <TableRow key={match.materialId}>
                  <TableCell>{match.materialName}</TableCell>
                  {/* <TableCell>
                    {match.oldEC3Match && (
                      <div className="line-through text-muted-foreground">
                        {match.oldEC3Match.name}
                      </div>
                    )}
                    <div className="text-green-600">{change.newEC3Match?.name}</div>
                  </TableCell> */}
                  <TableCell>{match.ec3MaterialName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {/* {change.oldEC3Match && (
                        <div className="line-through text-muted-foreground">
                          {change.oldDensity?.toFixed(0)} kg/m³
                        </div>
                      )} */}
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">
                          {match.densityMax && match.densityMin
                            ? ((match.densityMax + match.densityMin) / 2).toFixed(0)
                            : 'No density set'}
                        </span>
                      </div>
                      {/* {change.newEC3Match &&
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
                        )} */}
                    </div>
                  </TableCell>
                  <TableCell>{match.elementsAffectedCount}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">{match.projectName}</div>
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
          ) : (
            // singleProjectId && onNavigateToProject ? (
            //   <DropdownMenu>
            //     <DropdownMenuTrigger asChild>
            //       <Button className="gap-2 pr-3">
            //         <span>Confirm Changes</span>
            //         <div className="h-4 w-[1px] bg-white/20" />
            //         <ChevronDownIcon className="h-4 w-4" />
            //       </Button>
            //     </DropdownMenuTrigger>
            //     <DropdownMenuContent align="end">
            //       <DropdownMenuItem
            //         onClick={() => {
            //           handleConfirm()
            //           onNavigateToProject(singleProjectId)
            //         }}>
            //         Go to Project
            //       </DropdownMenuItem>
            //       <DropdownMenuItem onClick={handleConfirm}>Return to Library</DropdownMenuItem>
            //     </DropdownMenuContent>
            //   </DropdownMenu>
            // ) : (
            <Button onClick={onConfirm}>Confirm Changes</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
