import { useCallback } from 'react'
import { AutoSuggestedMatch } from '@/components/materials-library/ifc-card/ifc-card-item/AutoSuggestedMatch'
import { TemporaryMatch } from './interfaces/TemporaryMatch'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useMaterialMatching() {
  const {
    temporaryMatches,
    autoSuggestedMatches,
    setTemporaryMatches,
    closeConfirmMatchesModal,
    setSelectedMaterials,
  } = useMaterialsLibraryStore()

  const confirmMatches = useCallback(() => {
    closeConfirmMatchesModal()
    setTemporaryMatches([])
    setSelectedMaterials([])
  }, [closeConfirmMatchesModal, setSelectedMaterials, setTemporaryMatches])

  const acceptSuggestedMatch = useCallback(
    (match: TemporaryMatch) => {
      const newMatches = [...temporaryMatches]
      newMatches.push(match)
      setTemporaryMatches(newMatches)
    },
    [setTemporaryMatches, temporaryMatches]
  )

  const acceptAllSuggestedMatches = useCallback(() => {
    const newMatches = [...temporaryMatches]
    autoSuggestedMatches.forEach((match: AutoSuggestedMatch) => {
      newMatches.push({
        ...match,
        autoMatched: false,
      })
    })
    setTemporaryMatches(newMatches)
  }, [autoSuggestedMatches, setTemporaryMatches, temporaryMatches])

  const matchMaterial = useCallback(
    (materialIds: string[], { ec3MaterialData }: Pick<TemporaryMatch, 'ec3MaterialData'>) => {
      const newMatches = [...temporaryMatches]
      materialIds.forEach(materialId => {
        newMatches.push({
          materialId,
          ec3MatchId: ec3MaterialData.id,
          autoMatched: false,
          ec3MaterialData,
        })
      })
      setTemporaryMatches(newMatches)
      setSelectedMaterials([])
    },
    [setSelectedMaterials, setTemporaryMatches, temporaryMatches]
  )

  const unMatchMaterial = useCallback(
    (materialId: string) => {
      setTemporaryMatches(temporaryMatches.filter(match => match.materialId !== materialId))
    },
    [setTemporaryMatches, temporaryMatches]
  )

  const clearMatches = useCallback(() => {
    setTemporaryMatches([])
    setSelectedMaterials([])
  }, [setSelectedMaterials, setTemporaryMatches])

  const matchProgress = useCallback(() => {
    return {
      matchedCount: temporaryMatches.length,
      percentage: (temporaryMatches.length / (temporaryMatches.length + 1)) * 100,
    }
  }, [temporaryMatches.length])

  return {
    confirmMatches,
    acceptSuggestedMatch,
    acceptAllSuggestedMatches,
    matchMaterial,
    unMatchMaterial,
    clearMatches,
    matchProgress,
  }
}
