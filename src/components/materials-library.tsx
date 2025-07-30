'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
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
import { useMaterialMatching } from '@/hooks/materials/use-material-matching'
import { useMaterialSelection } from '@/hooks/materials/use-material-selection'
import { useMaterialsLibrary } from '@/hooks/materials/use-materials-library'
import { useOpenEPDSearch } from '@/hooks/materials/use-openepd-search'
import IMaterialClient from '@/interfaces/client/materials/IMaterialClient'
import { MaterialCard } from './materials-library/material-card'
import { MaterialsHeader } from './materials-library/materials-header'
import { OpenEPDHeader } from './materials-library/openepd-header'
import { OpenEPDProductCard } from './materials-library/openepd-product-card'

export function MaterialLibraryComponent() {
  // Custom hooks for state management
  const {
    selectedMaterials,
    materialsCount,
    selectedProject,
    searchValue,
    filteredMaterials,
    isProjectsWithStatsLoading,
    projectsWithStatsError,
    handleProjectChange,
    handleSearchChange,
    projectsWithStats,
  } = useMaterialsLibrary()

  const {
    searchTerm,
    products,
    isSearching,
    filteredProducts,
    handleSearch,
    handleSearchTermChange,
  } = useOpenEPDSearch()

  const {
    temporaryMatches,
    isMatchingInProgress,
    previewChanges,
    showPreview,
    autoSuggestedMatches,
    handleMatch,
    handleBulkMatch,
    handleShowPreview,
    handleCancelMatch,
    handleConfirmMatch,
    getMatchingProgress,
  } = useMaterialMatching()

  const {
    selectedMaterials: selectedMaterialIds,
    isSelected,
    handleSelect,
    clearSelection,
  } = useMaterialSelection()

  // Local state
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([])
  const openepdListRef = useRef<HTMLDivElement>(null)

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
        scrollToMatchingOpenEPD(material.name)
      }
    },
    [handleSelect, selectedMaterialIds]
  )

  const handleOpenEPDSelect = useCallback(
    (productId: string) => {
      if (selectedMaterialIds.length > 0) {
        handleBulkMatch(
          productId,
          selectedMaterialIds.map(m => m._id)
        )
        clearSelection()
      }
    },
    [selectedMaterialIds, handleBulkMatch, clearSelection]
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
    (materialId: string, openepdId: string) => {
      handleMatch([materialId], openepdId)
    },
    [handleMatch]
  )

  const handleDeleteMaterial = useCallback(async (material: IMaterialClient) => {
    // Implementation for deleting material
    console.log('Delete material:', material._id)
  }, [])

  // Auto-scroll functionality
  const scrollToMatchingOpenEPD = useCallback(
    (materialName: string) => {
      if (!autoScrollEnabled || !openepdListRef.current) return

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
            <Select value={selectedProject || 'all'} onValueChange={handleProjectChange}>
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
              <Button onClick={handleShowPreview}>Preview Changes</Button>
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
          {/* Left Column - IFC Materials */}
          <div className="flex flex-col border rounded-lg overflow-hidden h-full">
            <MaterialsHeader
              materialsCount={materialsCount}
              matchingProgress={matchingProgress}
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              onPreviewChanges={handleShowPreview}
              unappliedMatchesCount={unappliedMatchesCount}
            />

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="divide-y divide-transparent px-2">
                {filteredMaterials.map(material => (
                  <MaterialCard
                    key={material._id}
                    material={material}
                    isSelected={isSelected(material)}
                    temporaryMatch={
                      temporaryMatches[material._id]
                        ? products.find(p => p.id === temporaryMatches[material._id]) || null
                        : null
                    }
                    autoSuggestedMatch={autoSuggestedMatches[material._id] || null}
                    onSelect={handleMaterialSelect}
                    onMatch={handleMatch}
                    onDelete={handleDeleteMaterial}
                    onAcceptSuggestion={handleAcceptSuggestion}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - OpenEPD Products */}
          <div className="flex flex-col border rounded-lg overflow-hidden h-full">
            <OpenEPDHeader
              productsCount={products.length}
              searchTerm={searchTerm}
              isSearching={isSearching}
              autoScrollEnabled={autoScrollEnabled}
              onSearchTermChange={handleSearchTermChange}
              onSearch={handleSearch}
              onAutoScrollChange={setAutoScrollEnabled}
            />

            <div className="flex-1 overflow-y-auto min-h-0" ref={openepdListRef}>
              <div className="divide-y">
                {filteredProducts.map(product => (
                  <OpenEPDProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteProducts.includes(product.id)}
                    isSelectable={selectedMaterialIds.length > 0}
                    onSelect={handleOpenEPDSelect}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Preview Modal */}
      {showPreview && (
        <MaterialChangesPreviewModal
          changes={previewChanges}
          isOpen={showPreview}
          onClose={handleCancelMatch}
          onConfirm={handleConfirmMatch}
          onNavigateToProject={() => {}}
          isLoading={isMatchingInProgress}
        />
      )}
    </Card>
  )
}
