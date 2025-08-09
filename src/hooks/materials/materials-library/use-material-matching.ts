import { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { useTanStackMutation } from '@/hooks/use-tanstack-fetch'
import { MatchEC3Response } from '@/interfaces/materials/ec3/MatchEC3Response'
import IMaterialChange from '@/interfaces/materials/IMaterialChange'
import { MatchEC3Request } from '@/schemas/api'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useMaterialMatching() {
  const {
    acceptMatch,
    acceptAllMatches,
    confirmMatches,
    setIsMatchingInProgress,
    openMaterialChangesModal,
    setPreviewChanges,
  } = useMaterialsLibraryStore()

  const { mutateAsync: matchMutateAsync } = useTanStackMutation<MatchEC3Response, MatchEC3Request>(
    '/api/materials/ec3/match',
    {
      method: 'PUT',
      showSuccessToast: true,
      showErrorToast: true,
    }
  )

  // Enhanced accept all matches with confetti
  const acceptAllMatchesWithConfetti = useCallback(
    (openEPDId: string) => {
      acceptAllMatches(openEPDId)

      // Trigger confetti for successful match
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          '#2563eb',
          '#4f46e5',
          '#6366f1',
          '#7c3aed',
          '#8b5cf6',
          '#a855f7',
          '#d946ef',
          '#ec4899',
          '#f97316',
        ],
      })
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [
            '#2563eb',
            '#4f46e5',
            '#6366f1',
            '#7c3aed',
            '#8b5cf6',
            '#a855f7',
            '#d946ef',
            '#ec4899',
            '#f97316',
          ],
        })
      }, 150)
    },
    [acceptAllMatches]
  )

  // Enhanced accept match with confetti
  const acceptMatchWithConfetti = useCallback(
    (openEPDId: string, selectedMaterialId: string) => {
      acceptMatch(openEPDId, selectedMaterialId)

      // Trigger confetti for successful match
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          '#2563eb',
          '#4f46e5',
          '#6366f1',
          '#7c3aed',
          '#8b5cf6',
          '#a855f7',
          '#d946ef',
          '#ec4899',
          '#f97316',
        ],
      })
    },
    [acceptMatch]
  )

  // Enhanced show preview with API call
  const showPreviewChangesWithAPI = useCallback(async () => {
    setIsMatchingInProgress(true)

    try {
      // This will need to be implemented based on your API
      // const changes = await getPreviewChanges()
      // setPreviewChanges(changes)
      setPreviewChanges([])
      openMaterialChangesModal()
    } catch (error: unknown) {
      console.error('Failed to prepare preview:', error)
      // Toast will be handled in the component
    } finally {
      setIsMatchingInProgress(false)
    }
  }, [setIsMatchingInProgress, setPreviewChanges, openMaterialChangesModal])

  // Enhanced confirm match with mutation
  const confirmMatchWithMutation = useCallback(
    async (changesWithDensity: IMaterialChange[]) => {
      setIsMatchingInProgress(true)
      await matchMutateAsync({
        materialIds: changesWithDensity.map(change => change.materialId.toString()),
        ec3MatchId: changesWithDensity[0].materialId.toString(),
        density: changesWithDensity[0].newDensity,
      })
      confirmMatches()
    },
    [matchMutateAsync, confirmMatches, setIsMatchingInProgress]
  )

  return {
    acceptAllMatchesWithConfetti,
    acceptMatchWithConfetti,
    showPreviewChanges: showPreviewChangesWithAPI,
    confirmMatch: confirmMatchWithMutation,
  }
}
