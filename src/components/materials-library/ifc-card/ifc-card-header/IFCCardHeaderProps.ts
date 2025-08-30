export interface IFCCardHeaderProps {
  isSelectAllChecked: boolean
  isSelectAllDisabled: boolean
  materialsCount: number
  materialsSelectedCount: number
  matchingProgress: {
    matchedCount: number
    percentage: number
  }
  searchValue: string
  onSelectAllCheckedChange: (isChecked: boolean) => void
  clearMatches: () => void
  onSearchChange: (value: string) => void
}
