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
import {
  useGetMaterialBulk,
  useGetMaterialBulkByProject,
} from '@/hooks/materials/use-material-operations'
import {
  useGetProjectWithNestedDataBulk,
  useGetProjectWithNestedDataBulkByUser,
} from '@/hooks/projects/use-project-operations'
import { EC3Card } from './materials-library/ec3-card'
import { IFCCard } from './materials-library/ifc-card'
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
  } = useMaterialsLibraryStore()
  const { data: projectsWithNestedData } = useGetProjectWithNestedDataBulkByUser({
    userId: userId || '',
  })
  const { data: materialsData, isLoading: isMaterialsLoading } = useGetMaterialBulkByProject({
    projectId: selectedProject,
  })
  const { ec3SearchValue, EC3Materials, isSearching, handleEC3Search, handleEC3SearchTermChange } =
    useEC3Search()

  // const {
  //   acceptMatchWithConfetti,
  //   acceptAllMatchesWithConfetti,
  //   showPreviewChanges,
  //   confirmMatch,
  // } = useMaterialMatching()

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
      setSelectedMaterials(materialsData?.map(material => material._id) || [])
    }
  }, [setSelectedMaterials, isSelectAllChecked, materialsData])

  useEffect(() => {
    const allSelected =
      selectedMaterials.length === (materialsData?.length || 0) && (materialsData?.length || 0) > 0
    setIsSelectAllChecked(allSelected)
  }, [selectedMaterials, materialsData, setIsSelectAllChecked])

  // useEffect(() => {
  //   console.log('isSelectAllChecked', isSelectAllChecked)
  // }, [isSelectAllChecked])

  // Local state
  // const ec3ListRef = useRef<HTMLDivElement>(null)

  // Update materials when projects data changes
  // useEffect(() => {
  //   updateMaterials(projectsWithStats)
  // }, [projectsWithStats, updateMaterials])

  // Computed values
  // const matchingProgress = useMemo(
  //   () => getMatchingProgress(filteredMaterials),
  //   [getMatchingProgress, filteredMaterials]
  // )

  // const unappliedMatchesCount = useMemo(
  //   () => Object.keys(temporaryMatches).length,
  //   [temporaryMatches]
  // )

  // // Handlers
  // const handleMaterialSelect = useCallback(
  //   (material: IMaterialClient) => {
  //     handleSelect(material)
  //     if (selectedMaterialIds.length === 0) {
  //       scrollToMatchingEC3(material.name)
  //     }
  //   },
  //   [handleSelect, scrollToMatchingEC3, selectedMaterialIds.length]
  // )

  // const handleEC3Select = useCallback(
  //   (productId: string) => {
  //     if (selectedMaterialIds.length > 0) {
  //       acceptAllMatchesWithConfetti(productId)
  //       clearSelection()
  //     }
  //   },
  //   [selectedMaterialIds, acceptAllMatchesWithConfetti, clearSelection]
  // )

  // const handleToggleFavorite = useCallback((productId: string) => {
  //   setFavoriteProducts(prev => {
  //     if (prev.includes(productId)) {
  //       return prev.filter(id => id !== productId)
  //     } else {
  //       return [...prev, productId]
  //     }
  //   })
  // }, [])

  // const handleAcceptSuggestion = useCallback(
  //   (materialId: string, openEPDId: string) => {
  //     acceptMatchWithConfetti(openEPDId, materialId)
  //   },
  //   [acceptMatchWithConfetti]
  // )

  // const handleDeleteMaterial = useCallback(async (material: IMaterialClient) => {
  //   // Implementation for deleting material
  //   console.log('Delete material:', material._id)
  // }, [])

  // Auto-scroll functionality

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
        <Select value={selectedProject || 'all'} onValueChange={setSelectedProject}>
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
        {/* <div className="flex items-center gap-2">
              <Button disabled={true} onClick={showPreviewChanges}>
                Preview Changes
              </Button>
              {unappliedMatchesCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {unappliedMatchesCount} unapplied matches
                </Badge>
              )}
            </div> */}
      </div>
      <div className="flex gap-6">
        <IFCCard.Root>
          <IFCCard.Header
            isSelectAllChecked={isSelectAllChecked}
            onSelectAllCheckedChange={handleSelectAll}
            materialsCount={materialsData?.length || 0}
            materialsSelectedCount={selectedMaterials.length}
            matchingProgress={{
              matchedCount: 0,
              percentage: 0,
            }}
            searchValue={ifcSearchValue}
            onSearchChange={setIfcSearchValue}
          />

          <IFCCard.Content>
            {isMaterialsLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : !materialsData ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No materials found</p>
              </div>
            ) : (
              materialsData.map(material => (
                <IFCCard.Item
                  key={material._id}
                  material={material}
                  isSelected={selectedMaterials.includes(material._id)}
                  onSelect={handleIFCMaterialSelect}
                  isTemporaryMatch={false}
                  autoSuggestedMatch={null}
                  onUnmatch={() => {}}
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
                  isSelectable={false}
                  onSelect={() => {}}
                />
              ))
            )}
          </EC3Card.Content>
        </EC3Card.Root>

        {/* Preview Modal */}
        {/* <MaterialChangesPreviewModal
        changes={previewChanges}
        isOpen={isOpenMaterialChangesModal}
        onClose={cancelMatch}
        onConfirm={confirmMatch}
        onNavigateToProject={() => {}}
        isLoading={isMatchingInProgress}
      /> */}
      </div>
    </div>
  )
}
