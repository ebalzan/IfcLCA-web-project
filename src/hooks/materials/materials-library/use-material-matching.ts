import { useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AutoSuggestedMatch } from '@/components/materials-library/ifc-card/ifc-card-item/AutoSuggestedMatch'
import { useGetMaterialBulkByUser } from '@/hooks/materials/use-material-operations'
import { useGetProjectWithNestedDataBulkByUser } from '@/hooks/projects/use-project-operations'
import { TemporaryMatch } from './interfaces/TemporaryMatch'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useMaterialMatching() {
  const { userId } = useAuth()
  const {
    temporaryMatches,
    autoSuggestedMatches,
    setTemporaryMatches,
    closePreviewModal,
    setSelectedMaterials,
    selectedProject,
  } = useMaterialsLibraryStore()

  // Get all projects and materials data
  const { data: projectsWithNestedData } = useGetProjectWithNestedDataBulkByUser({
    userId: userId || '',
  })
  const { data: materialsByUser } = useGetMaterialBulkByUser({
    userId: userId || '',
  })

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
        const material = materialsByUser?.find(m => m._id === materialId)

        const project = projectsWithNestedData?.find(p =>
          p.materials.some(m => m._id === materialId)
        )

        const elementsAffectedCount =
          project?.elements.reduce(
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
          materialName: material?.name || 'Unknown Material',
          projectName: project?.name || 'Unknown Project',
          elementsAffectedCount,
        })
      })
      setTemporaryMatches(newMatches)
      setSelectedMaterials([])
    },
    [
      materialsByUser,
      projectsWithNestedData,
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
