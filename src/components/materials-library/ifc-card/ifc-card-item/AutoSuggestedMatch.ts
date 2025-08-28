import { TemporaryMatch } from '@/hooks/materials/materials-library/interfaces/TemporaryMatch'

export interface AutoSuggestedMatch extends TemporaryMatch {
  materialId: string
  ec3MatchId: string
  score: number
}
