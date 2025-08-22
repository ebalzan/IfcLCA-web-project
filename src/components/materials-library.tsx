'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MaterialChangesPreviewModal } from '@/components/material-changes-preview-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
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
import { useMaterialSelection } from '@/hooks/materials/materials-library/use-material-selection'
import { useGetProjectWithNestedData } from '@/hooks/projects/use-project-operations'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { EC3Header } from './materials-library/ec3-header'
import { EC3ProductCard } from './materials-library/ec3-product-card'
import { MaterialsLibraryIFCBox } from './materials-library/materials-library-ifc-box'

export function MaterialLibraryComponent() {
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectWithNestedData(projectId)

  const {
    selectedMaterials,
    materialsCount,
    selectedProject,
    searchValue,
    filteredMaterials,
    setSelectedProject,
    setSearchValue,
    updateMaterials,
    temporaryMatches,
    isMatchingInProgress,
    previewChanges,
    isOpenMaterialChangesModal,
    autoSuggestedMatches,
    getMatchingProgress,
    cancelMatch,
  } = useMaterialsLibraryStore()

  const {
    acceptMatchWithConfetti,
    acceptAllMatchesWithConfetti,
    showPreviewChanges,
    confirmMatch,
  } = useMaterialMatching()

  const {
    // searchValue,
    products,
    isSearching,
    filteredProducts,
    handleSearch,
    handleSearchTermChange,
  } = useEC3Search()

  const {
    selectedMaterials: selectedMaterialIds,
    isSelected,
    handleSelect,
    clearSelection,
  } = useMaterialSelection()

  // Local state
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([])
  const ec3ListRef = useRef<HTMLDivElement>(null)

  // Update materials when projects data changes
  useEffect(() => {
    updateMaterials(projectsWithStats)
  }, [projectsWithStats, updateMaterials])

  // Computed values
  const matchingProgress = useMemo(
    () => getMatchingProgress(filteredMaterials),
    [getMatchingProgress, filteredMaterials]
  )

  const unappliedMatchesCount = useMemo(
    () => Object.keys(temporaryMatches).length,
    [temporaryMatches]
  )

  // Handlers
  const handleMaterialSelect = useCallback(
    (material: IMaterialClient) => {
      handleSelect(material)
      if (selectedMaterialIds.length === 0) {
        scrollToMatchingEC3(material.name)
      }
    },
    [handleSelect, scrollToMatchingEC3, selectedMaterialIds.length]
  )

  const handleEC3Select = useCallback(
    (productId: string) => {
      if (selectedMaterialIds.length > 0) {
        acceptAllMatchesWithConfetti(productId)
        clearSelection()
      }
    },
    [selectedMaterialIds, acceptAllMatchesWithConfetti, clearSelection]
  )

  const handleToggleFavorite = useCallback((productId: string) => {
    setFavoriteProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }, [])

  const handleAcceptSuggestion = useCallback(
    (materialId: string, openEPDId: string) => {
      acceptMatchWithConfetti(openEPDId, materialId)
    },
    [acceptMatchWithConfetti]
  )

  const handleDeleteMaterial = useCallback(async (material: IMaterialClient) => {
    // Implementation for deleting material
    console.log('Delete material:', material._id)
  }, [])

  // Auto-scroll functionality
  const scrollToMatchingEC3 = useCallback(
    (materialName: string) => {
      if (!autoScrollEnabled || !ec3ListRef.current) return

      // Implementation for auto-scrolling to matching OpenEPD product
      console.log('Scroll to matching OpenEPD for:', materialName)
    },
    [autoScrollEnabled]
  )

  // Loading and error states
  if (isProjectsWithStatsLoading) {
    return <LoadingSpinner />
  }

  if (projectsWithStatsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading materials library</p>
      </div>
    )
  }

  return (
    <Card className="h-[calc(100vh-6rem)] flex flex-col overflow-hidden border-0 shadow-none -mt-14">
      <CardHeader className="pb-0 flex-shrink-0 px-0">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <Select value={selectedProject || 'all'} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectsWithStats?.map(project => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button disabled={true} onClick={showPreviewChanges}>
                Preview Changes
              </Button>
              {unappliedMatchesCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {unappliedMatchesCount} unapplied matches
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 min-h-0">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Left Box - IFC Materials Box */}
          <div className="flex flex-col border rounded-lg overflow-hidden h-full">
            <MaterialsLibraryIFCBox.Header
              materialsCount={materialsCount}
              matchingProgress={matchingProgress}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onPreviewChanges={showPreviewChanges}
              unappliedMatchesCount={unappliedMatchesCount}
            />

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="divide-y divide-transparent px-2">
                {filteredMaterials.map(filteredMaterial => (
                  <MaterialsLibraryIFCBox.Card
                    key={filteredMaterial._id}
                    material={filteredMaterial}
                    isSelected={isSelected(filteredMaterial)}
                    temporaryMatch={
                      temporaryMatches[filteredMaterial._id]
                        ? products.find(p => p.id === temporaryMatches[filteredMaterial._id]) ||
                          null
                        : null
                    }
                    autoSuggestedMatch={autoSuggestedMatches[filteredMaterial._id] || null}
                    onSelect={handleMaterialSelect}
                    onMatch={() =>
                      acceptMatchWithConfetti(
                        filteredMaterial.ec3MatchId?._id.toString() || '',
                        filteredMaterial._id
                      )
                    }
                    onDelete={handleDeleteMaterial}
                    onAcceptSuggestion={handleAcceptSuggestion}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Box - OpenEPD Products */}
          <div className="flex flex-col border rounded-lg overflow-hidden h-full">
            <EC3Header
              productsCount={products.length}
              searchTerm={searchValue}
              isSearching={isSearching}
              autoScrollEnabled={autoScrollEnabled}
              onSearchTermChange={handleSearchTermChange}
              onSearch={handleSearch}
              onAutoScrollChange={setAutoScrollEnabled}
            />

            <div className="flex-1 overflow-y-auto min-h-0" ref={ec3ListRef}>
              <div className="divide-y">
                {filteredProducts.map(product => (
                  <EC3ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteProducts.includes(product.id)}
                    isSelectable={selectedMaterialIds.length > 0}
                    onSelect={handleEC3Select}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Preview Modal */}
      <MaterialChangesPreviewModal
        changes={previewChanges}
        isOpen={isOpenMaterialChangesModal}
        onClose={cancelMatch}
        onConfirm={confirmMatch}
        onNavigateToProject={() => {}}
        isLoading={isMatchingInProgress}
      />
    </Card>
  )
}
