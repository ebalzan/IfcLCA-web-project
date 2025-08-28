import { AutoSuggestedMatch } from '@/components/materials-library/ifc-card/ifc-card-item/AutoSuggestedMatch'
import { TemporaryMatch } from './TemporaryMatch'

export interface MaterialsLibraryStoreState {
  selectedProject: string
  temporaryMatches: TemporaryMatch[]
  selectedMaterials: string[]
  matchingProgress: {
    matchedCount: number
    percentage: number
  }
  isSelectAllChecked: boolean
  isPreviewModalOpen: boolean
  autoSuggestedMatches: AutoSuggestedMatch[]
  ifcSearchValue: string
  ec3SearchValue: string
  isAutoScrollEnabled: boolean
  ec3SearchFields: string[]
  ec3SearchSortBy: string
}
