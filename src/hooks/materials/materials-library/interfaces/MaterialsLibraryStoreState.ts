import { AutoSuggestedMatch } from '@/components/materials-library/ifc-card/ifc-card-item/AutoSuggestedMatch'
import { IEC3MatchClient } from '@/interfaces/client/materials/IEC3MatchClient'

export interface MaterialsLibraryStoreState {
  selectedProject: string
  temporaryMatches: Omit<IEC3MatchClient, '_id'>[]
  selectedMaterials: string[]
  isSelectAllChecked: boolean
  isOpenConfirmMatchesModal: boolean
  autoSuggestedMatches: AutoSuggestedMatch[]
  ifcSearchValue: string
  ec3SearchValue: string
  isAutoScrollEnabled: boolean
  ec3SearchFields: string[]
  ec3SearchSortBy: string
}
