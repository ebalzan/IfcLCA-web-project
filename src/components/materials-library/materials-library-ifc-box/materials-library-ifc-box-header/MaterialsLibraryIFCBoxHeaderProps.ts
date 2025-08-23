export interface MaterialsLibraryIFCBoxHeaderProps {
  materialsCount: number
  matchingProgress: {
    matchedCount: number
    percentage: number
  }
  searchValue: string
  onSearchChange: (value: string) => void
}
