import { IEC3Match } from '@/interfaces/materials/IEC3Match'

export interface MaterialsLibraryStoreActions {
  setSelectedProject: (projectId: string) => void
  setIfcSearchValue: (value: string) => void
  setEc3SearchValue: (value: string) => void
  setIsAutoScrollEnabled: (isAutoScrollEnabled: boolean) => void
  confirmMatches: () => void
  acceptMatch: (match: Omit<IEC3Match, '_id'>) => void
  acceptAllMatches: () => void
  cancelMatch: () => void
  openConfirmMatchesModal: () => void
  closeConfirmMatchesModal: () => void
  resetState: () => void
}
