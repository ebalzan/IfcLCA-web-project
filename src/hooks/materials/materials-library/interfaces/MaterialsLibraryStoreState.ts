import { AutoSuggestedMatch } from '@/components/materials-library/ifc-card/ifc-card-item/AutoSuggestedMatch'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'

export interface MaterialsLibraryStoreState {
  selectedProject: string
  temporaryMatches: Omit<IEC3Match, '_id'>[]
  selectedMaterials: string[]
  isSelectAllChecked: boolean
  isOpenConfirmMatchesModal: boolean
  autoSuggestedMatches: AutoSuggestedMatch[]
  ifcSearchValue: string
  ec3SearchValue: string
  isAutoScrollEnabled: boolean
}
