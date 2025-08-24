import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { AutoSuggestedMatch } from './AutoSuggestedMatch'

export interface IFCCardItemProps {
  material: IMaterialClient
  isTemporaryMatch: boolean
  autoSuggestedMatch: AutoSuggestedMatch | null
  onUnmatch: (materialId: string, ec3MatchId: string | null) => void
  onDelete: (materialId: string) => void
  onAcceptSuggestion: (materialId: string, ec3MatchId: string) => void
}
