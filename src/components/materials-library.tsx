'use client'

import { useCallback, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMaterialsLibraryStore } from '@/hooks/materials/materials-library/materials-library-store'
import { useEC3Search } from '@/hooks/materials/materials-library/use-ec3-search'
import { useMaterialMatching } from '@/hooks/materials/materials-library/use-material-matching'
import {
  useGetMaterialBulkByProject,
  useGetMaterialBulkByUser,
} from '@/hooks/materials/use-material-operations'
import { useGetProjectWithNestedDataBulkByUser } from '@/hooks/projects/use-project-operations'
import { useCreateBulkMatch } from '@/hooks/use-create-match'
import { parseDensity, parseIndicator } from '@/utils/parses'
import { transformSnakeToCamel } from '@/utils/transformers'
import { MaterialChangesPreviewModal } from './material-changes-preview-modal'
import { EC3Card } from './materials-library/ec3-card'
import { IFCCard } from './materials-library/ifc-card'
import { Button } from './ui/button'
import { LoadingSpinner } from './ui/loading-spinner'

export function MaterialLibraryComponent() {
  const { userId } = useAuth()
  const {
    selectedProject,
    setSelectedProject,
    ifcSearchValue,
    setIfcSearchValue,
    setSelectedMaterials,
    selectedMaterials,
    isSelectAllChecked,
    setIsSelectAllChecked,
    temporaryMatches,
    matchingProgress,
    setMatchingProgress,
    isPreviewModalOpen,
    openPreviewModal,
    closePreviewModal,
    filteredMaterials,
    setFilteredMaterials,
  } = useMaterialsLibraryStore()
  const { data: projectsWithNestedData } = useGetProjectWithNestedDataBulkByUser({
    userId: userId || '',
  })
  const { data: materialsByUser, isLoading: isMaterialsByUserLoading } = useGetMaterialBulkByUser({
    userId: userId || '',
  })
  const { data: materialsByProject, isLoading: isMaterialsByProjectLoading } =
    useGetMaterialBulkByProject({
      projectId: selectedProject,
      userId: userId || '',
    })
  const { ec3SearchValue, EC3Materials, isSearching, handleEC3Search, handleEC3SearchTermChange } =
    useEC3Search()
  const {
    confirmMatches,
    acceptSuggestedMatch,
    acceptAllSuggestedMatches,
    matchMaterial,
    unMatchMaterial,
    clearMatches,
  } = useMaterialMatching()
  const { mutateAsync: createBulkMatch, isLoading: isCreatingBulkMatch } = useCreateBulkMatch()

  useEffect(() => {
    if (selectedProject === 'all') {
      setFilteredMaterials(materialsByUser || [])
    } else {
      setFilteredMaterials(materialsByProject || [])
    }
  }, [selectedProject, materialsByUser, materialsByProject, setFilteredMaterials])

  const handleConfirmMatches = useCallback(async () => {
    const transformedMatches = temporaryMatches.map(match => {
      const ec3Data = transformSnakeToCamel(match.ec3MaterialData)
      // Remove the name field to avoid duplicate key errors
      const { name, ...ec3DataWithoutName } = ec3Data

      return {
        ...ec3DataWithoutName,
        category: match.ec3MaterialData.category.name,
        ec3MatchId: match.ec3MatchId,
        autoMatched: match.autoMatched,
        materialId: match.materialId,
      }
    })

    await createBulkMatch({
      materialIds: temporaryMatches.map(match => match.materialId),
      updates: transformedMatches.map(match => ({
        ...match,
        densityMin: match.densityMin ? parseDensity(match.densityMin) : null,
        densityMax: match.densityMax ? parseDensity(match.densityMax) : null,
        gwp: parseIndicator(match.gwp ?? ''),
        ubp: parseIndicator(match.ubp ?? ''),
        penre: parseIndicator(match.penre ?? ''),
        declaredUnit: match.declaredUnit,
      })),
    })
    confirmMatches()
  }, [confirmMatches, createBulkMatch, temporaryMatches])

  const handleIFCMaterialSelect = useCallback(
    (materialId: string) => {
      const isAlreadySelected = selectedMaterials.some(id => id === materialId)
      setSelectedMaterials(
        isAlreadySelected
          ? selectedMaterials.filter(id => id !== materialId)
          : [...selectedMaterials, materialId]
      )
    },
    [selectedMaterials, setSelectedMaterials]
  )

  const handleSelectAll = useCallback(() => {
    if (isSelectAllChecked) {
      setSelectedMaterials([])
    } else {
      const selectableMaterials = filteredMaterials?.filter(
        material => !temporaryMatches.some(match => match.materialId === material._id)
      )
      setSelectedMaterials(selectableMaterials?.map(material => material._id) || [])
    }
  }, [filteredMaterials, setSelectedMaterials, isSelectAllChecked, temporaryMatches])

  useEffect(() => {
    const selectableMaterials = filteredMaterials?.filter(
      material => !temporaryMatches.some(match => match.materialId === material._id)
    )
    const allSelected =
      selectedMaterials.length === (selectableMaterials?.length || 0) &&
      (selectableMaterials?.length || 0) > 0
    setIsSelectAllChecked(allSelected)
  }, [selectedMaterials, filteredMaterials, setIsSelectAllChecked, temporaryMatches])

  useEffect(() => {
    setMatchingProgress({
      matchedCount: temporaryMatches.length,
      percentage: (temporaryMatches.length / (filteredMaterials?.length || 0)) * 100,
    })
  }, [filteredMaterials?.length, setMatchingProgress, temporaryMatches.length])

  // const handleAcceptSuggestion = useCallback(
  //   (materialId: string, openEPDId: string) => {
  //     acceptMatchWithConfetti(openEPDId, materialId)
  //   },
  //   [acceptMatchWithConfetti]
  // )

  // const scrollToMatchingEC3 = useCallback(
  //   (materialName: string) => {
  //     if (!autoScrollEnabled || !ec3ListRef.current) return

  //     // Implementation for auto-scrolling to matching OpenEPD product
  //     console.log('Scroll to matching OpenEPD for:', materialName)
  //   },
  //   [autoScrollEnabled]
  // )

  return (
    <div className="flex gap-6 flex-col">
      <div className="flex justify-end gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectsWithNestedData?.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button disabled={temporaryMatches.length === 0} onClick={openPreviewModal}>
            Preview Changes
          </Button>
          {/* {unappliedMatchesCount > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {unappliedMatchesCount} unapplied matches
            </Badge>
          )} */}
        </div>
      </div>
      <div className="flex gap-6">
        <IFCCard.Root>
          <IFCCard.Header
            isSelectAllChecked={isSelectAllChecked}
            isSelectAllDisabled={filteredMaterials?.length === 0}
            onSelectAllCheckedChange={handleSelectAll}
            materialsCount={filteredMaterials?.length || 0}
            materialsSelectedCount={selectedMaterials.length}
            matchingProgress={{
              matchedCount: matchingProgress.matchedCount,
              percentage: matchingProgress.percentage,
            }}
            searchValue={ifcSearchValue}
            onSearchChange={setIfcSearchValue}
            clearMatches={clearMatches}
          />

          <IFCCard.Content>
            {isMaterialsByUserLoading || isMaterialsByProjectLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : !filteredMaterials || filteredMaterials.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No materials found</p>
              </div>
            ) : (
              filteredMaterials.map(material => (
                <IFCCard.Item
                  key={material._id}
                  material={material}
                  ec3MaterialData={
                    temporaryMatches.find(match => match.materialId === material._id)
                      ?.ec3MaterialData || null
                  }
                  isSelected={selectedMaterials.includes(material._id)}
                  isSelectable={!temporaryMatches.some(match => match.materialId === material._id)}
                  onSelect={handleIFCMaterialSelect}
                  isTemporaryMatch={temporaryMatches.some(
                    match => match.materialId === material._id
                  )}
                  autoSuggestedMatch={null}
                  onUnmatch={() => unMatchMaterial(material._id)}
                  onDelete={() => {}}
                  onAcceptSuggestion={() => {}}
                />
              ))
            )}
          </IFCCard.Content>
        </IFCCard.Root>

        <EC3Card.Root>
          <EC3Card.Header
            searchTerm={ec3SearchValue}
            isSearching={isSearching}
            isAutoScrollEnabled={false}
            onSearchTermChange={handleEC3SearchTermChange}
            onSearch={handleEC3Search}
            onIsAutoScrollEnabledChange={() => {}}
          />
          <EC3Card.Content>
            {isSearching ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : !EC3Materials || EC3Materials.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No materials found</p>
              </div>
            ) : (
              EC3Materials.map(ec3Material => (
                <EC3Card.Item
                  key={ec3Material.id}
                  material={ec3Material}
                  isSelectable={selectedMaterials.length > 0}
                  onSelect={() => {
                    matchMaterial(selectedMaterials, { ec3MaterialData: ec3Material })
                  }}
                />
              ))
            )}
          </EC3Card.Content>
        </EC3Card.Root>

        {/* Preview Modal */}
        <MaterialChangesPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={closePreviewModal}
          onConfirm={handleConfirmMatches}
          isLoading={isCreatingBulkMatch}
        />
      </div>
    </div>
  )
}
