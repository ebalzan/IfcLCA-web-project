import { TemporaryMatch } from './TemporaryMatch'

export interface MaterialsLibraryStoreActions {
  setSelectedProject: (projectId: string) => void
  setIfcSearchValue: (value: string) => void
  setEc3SearchValue: (value: string) => void
  setMatchingProgress: (progress: { matchedCount: number; percentage: number }) => void
  setIsAutoScrollEnabled: (isAutoScrollEnabled: boolean) => void
  setEc3SearchFields: (fields: string[]) => void
  setEc3SearchSortBy: (sortBy: string) => void
  setSelectedMaterials: (materials: string[]) => void
  setIsSelectAllChecked: (isSelectAllChecked: boolean) => void
  setTemporaryMatches: (matches: TemporaryMatch[]) => void
  openConfirmMatchesModal: () => void
  closeConfirmMatchesModal: () => void
  resetState: () => void
}
