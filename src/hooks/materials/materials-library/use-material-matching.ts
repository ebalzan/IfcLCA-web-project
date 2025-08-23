import { useMaterialsLibraryStore } from './materials-library-store'

export function useMaterialMatching() {
  const { acceptMatch, acceptAllMatches } = useMaterialsLibraryStore()

  // const { mutateAsync: matchMutateAsync } = useTanStackMutation<MatchEC3Response, MatchEC3Request>(
  //   '/api/materials/ec3/match',
  //   {
  //     method: 'PUT',
  //     showSuccessToast: true,
  //     showErrorToast: true,
  //   }
  // )

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
    acceptAllMatches,
    acceptMatch,
    // confirmMatch: confirmMatchWithMutation,
  }
}
