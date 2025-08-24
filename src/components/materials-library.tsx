'use client'

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
import { EC3Card } from './materials-library/ec3-card'
import { IFCCard } from './materials-library/ifc-card'
import { LoadingSpinner } from './ui/loading-spinner'

export function MaterialLibraryComponent() {
  const {
    selectedProject,
    setSelectedProject,
    ifcSearchValue,
    setIfcSearchValue,
    ec3SearchValue,
    setEc3SearchValue,
  } = useMaterialsLibraryStore()
  const { data: projectsWithNestedData } = useGetProjectWithNestedDataBulk()

  const { data: materialsData, isLoading: isMaterialsLoading } = useGetMaterialBulk(
    selectedProject === 'all' ? undefined : selectedProject
  )

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
            materialsCount={materialsData.length}
            matchingProgress={{
              matchedCount: 0,
              percentage: 0,
            }}
            searchValue={ifcSearchValue}
            onSearchChange={setIfcSearchValue}
          />

          <IFCCard.Content>
            {materialsData.map(material => (
              <IFCCard.Item
                key={material._id}
                material={material}
                isTemporaryMatch={false}
                autoSuggestedMatch={null}
                onUnmatch={() => {}}
                onDelete={() => {}}
                onAcceptSuggestion={() => {}}
              />
            ))}
          </IFCCard.Content>
        </IFCCard.Root>

        <EC3Card.Root>
          <EC3Card.Header
            productsCount={0}
            searchTerm={ec3SearchValue}
            isSearching={false}
            autoScrollEnabled={false}
            onSearchTermChange={setEc3SearchValue}
            onSearch={() => {}}
            onAutoScrollChange={() => {}}
          />

          <EC3Card.Content>
            <div className="p-2 divide-y">
              {/* {materialsData.map(product => (
                <EC3Card.Item
                  key={product._id}
                  material={product}
                  isSelectable={false}
                  onSelect={() => {}}
                />
              ))} */}
            </div>
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
