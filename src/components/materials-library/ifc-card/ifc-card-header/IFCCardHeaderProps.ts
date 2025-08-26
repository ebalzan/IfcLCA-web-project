export interface IFCCardHeaderProps {
  isSelectAllChecked: boolean
  onSelectAllCheckedChange: (isChecked: boolean) => void
  materialsCount: number
  materialsSelectedCount: number
  matchingProgress: {
    matchedCount: number
    percentage: number
  }
  searchValue: string
  onSearchChange: (value: string) => void
}
