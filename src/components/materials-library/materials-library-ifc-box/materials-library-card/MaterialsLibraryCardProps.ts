import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { AutoSuggestedMatch } from './AutoSuggestedMatch'

export interface MaterialsLibraryCardProps {
  material: IMaterialClient
  isSelected: boolean
  temporaryMatch: IMaterialClient | null
  autoSuggestedMatch: AutoSuggestedMatch | null
  onSelect: (material: IMaterialClient) => void
  onMatch: (materialId: string, openEPDId: string | null) => void
  onDelete: (material: IMaterialClient) => void
  onAcceptSuggestion: (materialId: string, openEPDId: string) => void
}
