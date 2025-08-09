import IMaterialClient from '@/interfaces/client/materials/IMaterialClient'
import { OpenEPDProduct } from '@/lib/services/openepd-service'
import { AutoSuggestedMatch } from './AutoSuggestedMatch'

export interface MaterialsLibraryCardProps {
  material: IMaterialClient
  isSelected: boolean
  temporaryMatch: OpenEPDProduct | null
  autoSuggestedMatch: AutoSuggestedMatch | null
  onSelect: (material: IMaterialClient) => void
  onMatch: (materialId: string, openEPDId: string | null) => void
  onDelete: (material: IMaterialClient) => void
  onAcceptSuggestion: (materialId: string, openEPDId: string) => void
}
