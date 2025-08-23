import { AutoSuggestedMatch } from '@/components/materials-library/materials-library-ifc-box/materials-library-ifc-box-card/AutoSuggestedMatch'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'

export interface MaterialsLibraryStoreState {
  selectedProject: string
  temporaryMatches: Omit<IEC3Match, '_id'>[]
  isOpenConfirmMatchesModal: boolean
  autoSuggestedMatches: AutoSuggestedMatch[]
}
