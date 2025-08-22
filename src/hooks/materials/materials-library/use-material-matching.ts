import { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { useTanStackMutation } from '@/hooks/use-tanstack-fetch'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useMaterialMatching() {
  const { acceptMatch, acceptAllMatches, confirmMatches, setIsMatchingInProgress } =
    useMaterialsLibraryStore()

  // const { mutateAsync: matchMutateAsync } = useTanStackMutation<MatchEC3Response, MatchEC3Request>(
  //   '/api/materials/ec3/match',
  //   {
  //     method: 'PUT',
  //     showSuccessToast: true,
  //     showErrorToast: true,
  //   }
  // )

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

  // Enhanced confirm match with mutation
  // const confirmMatchWithMutation = useCallback(
  //   async (changesWithDensity: IMaterialClient[]) => {
  //     setIsMatchingInProgress(true)
  //     await matchMutateAsync({
  //       materialIds: changesWithDensity.map(change => change._id),
  //       ec3MatchId: changesWithDensity[0]._id,
  //       density: changesWithDensity[0].density,
  //     })
  //     confirmMatches()
  //   },
  //   [matchMutateAsync, confirmMatches, setIsMatchingInProgress]
  // )

  return {
    acceptAllMatchesWithConfetti,
    acceptMatchWithConfetti,
    // confirmMatch: confirmMatchWithMutation,
  }
}
