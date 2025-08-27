import { IEC3MatchClient } from '@/interfaces/client/materials/IEC3MatchClient'

export interface MaterialsLibraryStoreActions {
  setSelectedProject: (projectId: string) => void
  setIfcSearchValue: (value: string) => void
  setEc3SearchValue: (value: string) => void
  setIsAutoScrollEnabled: (isAutoScrollEnabled: boolean) => void
  setEc3SearchFields: (fields: string[]) => void
  setEc3SearchSortBy: (sortBy: string) => void
  setSelectedMaterials: (materials: string[]) => void
  setIsSelectAllChecked: (isSelectAllChecked: boolean) => void
  confirmMatches: () => void
  acceptMatch: (match: Omit<IEC3MatchClient, '_id'>) => void
  acceptAllMatches: () => void
  cancelMatch: () => void
  openConfirmMatchesModal: () => void
  closeConfirmMatchesModal: () => void
  resetState: () => void
}
