'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMaterialsLibraryStore } from '@/hooks/materials/materials-library/materials-library-store'
import { useGetMaterialBulk } from '@/hooks/materials/use-material-operations'
import { useGetProjectWithNestedDataBulk } from '@/hooks/projects/use-project-operations'
import { MaterialsLibraryIFCBox } from './materials-library/materials-library-ifc-box'
import { LoadingSpinner } from './ui/loading-spinner'

export function MaterialLibraryComponent() {
  const { selectedProject, setSelectedProject } = useMaterialsLibraryStore()
  const { data: projectsWithNestedData } = useGetProjectWithNestedDataBulk()

  const { data: materialsData, isLoading: isMaterialsLoading } = useGetMaterialBulk(
    selectedProject === 'all' ? undefined : selectedProject
  )
  console.log('SELECTED PROJECT', selectedProject)

  // const {
  //   selectedMaterials,
  //   materialsCount,
  //   selectedProject,
  //   searchValue,
  //   filteredMaterials,
  //   setSelectedProject,
  //   setSearchValue,
  //   updateMaterials,
  //   temporaryMatches,
  //   isMatchingInProgress,
  //   previewChanges,
  //   isOpenMaterialChangesModal,
  //   autoSuggestedMatches,
  //   getMatchingProgress,
  //   cancelMatch,
  // } = useMaterialsLibraryStore()

  // const {
  //   acceptMatchWithConfetti,
  //   acceptAllMatchesWithConfetti,
  //   showPreviewChanges,
  //   confirmMatch,
  // } = useMaterialMatching()

  // const {
  //   // searchValue,
  //   products,
  //   isSearching,
  //   filteredProducts,
  //   handleSearch,
  //   handleSearchTermChange,
  // } = useEC3Search()

  // Local state
  // const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  // const [favoriteProducts, setFavoriteProducts] = useState<string[]>([])
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

  // // Loading and error states
  // if (isProjectsWithStatsLoading) {
  //   return <LoadingSpinner />
  // }

  // if (projectsWithStatsError) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <p className="text-red-500">Error loading materials library</p>
  //     </div>
  //   )
  // }

  // console.log(materialsData)

  if (isMaterialsLoading) {
    return <LoadingSpinner />
  }

  if (!materialsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No materials found</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 flex-col">
      <div className="flex justify-end gap-2">
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
      <div className="flex-1 items-center gap-6">
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader>
            <MaterialsLibraryIFCBox.Header
              materialsCount={materialsData.length}
              matchingProgress={{
                matchedCount: 0,
                percentage: 0,
              }}
              searchValue={''}
              onSearchChange={() => {}}
            />
          </CardHeader>

          <CardContent className="flex-1 p-6 min-h-0">
            {materialsData.map(material => (
              <MaterialsLibraryIFCBox.Card
                key={material._id}
                material={material}
                isTemporaryMatch={false}
                autoSuggestedMatch={null}
                onUnmatch={() => {}}
                onDelete={() => {}}
                onAcceptSuggestion={() => {}}
              />
            ))}
          </CardContent>

          {/* <MaterialsLibraryIFCBox.Card /> */}

          {/* <CardContent className="flex-1 p-6 min-h-0">
        <div className="grid grid-cols-2 gap-6 h-full">
          // Left Box - IFC Materials Box
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
                    // onDelete={handleDeleteMaterial}
                    onAcceptSuggestion={handleAcceptSuggestion}
                  />
                ))}
              </div>
            </div>
          </div>
          // Right Box - OpenEPD Products
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
                    // onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent> */}

          {/* Preview Modal */}
          {/* <MaterialChangesPreviewModal
        changes={previewChanges}
        isOpen={isOpenMaterialChangesModal}
        onClose={cancelMatch}
        onConfirm={confirmMatch}
        onNavigateToProject={() => {}}
        isLoading={isMatchingInProgress}
      /> */}
        </Card>
      </div>
    </div>
  )
}
