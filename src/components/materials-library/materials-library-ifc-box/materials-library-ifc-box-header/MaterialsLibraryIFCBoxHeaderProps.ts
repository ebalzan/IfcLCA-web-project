export interface MaterialsLibraryIFCBoxHeaderProps {
  materialsCount: number
  matchingProgress: {
    totalMaterials: number
    matchedCount: number
    percentage: number
  }
  searchValue: string
  onSearchChange: (value: string) => void
  onPreviewChanges: () => void
  unappliedMatchesCount: number
}
