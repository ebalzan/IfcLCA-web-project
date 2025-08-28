import { useCallback } from 'react'
import { AutoSuggestedMatch } from '@/components/materials-library/ifc-card/ifc-card-item/AutoSuggestedMatch'
import { useGetProjectWithNestedData } from '@/hooks/projects/use-project-operations'
import { TemporaryMatch } from './interfaces/TemporaryMatch'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useMaterialMatching() {
  const {
    temporaryMatches,
    autoSuggestedMatches,
    setTemporaryMatches,
    closePreviewModal,
    setSelectedMaterials,
    selectedProject,
  } = useMaterialsLibraryStore()
  const { data: projectWithNestedData } = useGetProjectWithNestedData({ id: selectedProject })

  const confirmMatches = useCallback(() => {
    closePreviewModal()
    setTemporaryMatches([])
    setSelectedMaterials([])
  }, [closePreviewModal, setSelectedMaterials, setTemporaryMatches])

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
        const elementsAffectedCount =
          projectWithNestedData?.elements.reduce(
            (acc, element) =>
              acc +
              element.materialRefs.reduce(
                (acc, materialRef) => acc + (materialRef._id === materialId ? 1 : 0),
                0
              ),
            0
          ) || 0

        newMatches.push({
          materialId,
          ec3MatchId: ec3MaterialData.id,
          autoMatched: false,
          ec3MaterialData,
          materialName:
            projectWithNestedData?.materials.find(material => material._id === materialId)?.name ||
            '',
          projectName: projectWithNestedData?.name || '',
          elementsAffectedCount,
        })
      })
      setTemporaryMatches(newMatches)
      setSelectedMaterials([])
    },
    [
      projectWithNestedData?.elements,
      projectWithNestedData?.materials,
      projectWithNestedData?.name,
      setSelectedMaterials,
      setTemporaryMatches,
      temporaryMatches,
    ]
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
