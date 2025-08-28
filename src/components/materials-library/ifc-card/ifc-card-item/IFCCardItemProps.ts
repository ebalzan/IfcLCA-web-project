import { TemporaryMatch } from '@/hooks/materials/materials-library/interfaces/TemporaryMatch'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { AutoSuggestedMatch } from './AutoSuggestedMatch'

export interface IFCCardItemProps {
  material: IMaterialClient
  isTemporaryMatch: boolean
  isSelected: boolean
  isSelectable: boolean
  autoSuggestedMatch: AutoSuggestedMatch | null
  ec3MaterialData: TemporaryMatch['ec3MaterialData'] | null
  onSelect: (materialId: string) => void
  onUnmatch: (materialId: string, ec3MatchId: string | null) => void
  onDelete: (materialId: string) => void
  onAcceptSuggestion: (materialId: string, ec3MatchId: string) => void
}
