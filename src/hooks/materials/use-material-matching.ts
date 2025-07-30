import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import confetti from 'canvas-confetti'
import { toast } from '@/hooks/use-toast'
import IMaterialChange from '@/interfaces/materials/IMaterialChange'
import { api } from '@/lib/fetch'
import { useTanStackMutation } from '../use-tanstack-fetch'

export interface MaterialMatchingState {
  temporaryMatches: Record<string, string>
  isMatchingInProgress: boolean
  previewChanges: IMaterialChange | null
  showPreview: boolean
  autoSuggestedMatches: Record<string, AutoSuggestedMatch>
}

interface AutoSuggestedMatch {
  openepdId: string
  score: number
  name: string
}

export function useMaterialMatching() {
  const [temporaryMatches, setTemporaryMatches] = useState<Record<string, string>>({})
  const [isMatchingInProgress, setIsMatchingInProgress] = useState<boolean>(false)
  const [previewChanges, setPreviewChanges] = useState<IMaterialChange | null>(null)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [autoSuggestedMatches, setAutoSuggestedMatches] = useState<
    Record<string, AutoSuggestedMatch>
  >({})

  const matchMutation = useTanStackMutation('/api/materials/openepd/match', {
    showSuccessToast: true,
    showErrorToast: true,
  })

  const handleMatch = useCallback(
    (materialIds: string[], openepdId: string | null) => {
      const newMatches = { ...temporaryMatches }
      materialIds.forEach(id => {
        if (openepdId) {
          newMatches[id] = openepdId
        } else {
          delete newMatches[id]
        }
      })
      setTemporaryMatches(newMatches)
    },
    [temporaryMatches]
  )

  const handleBulkMatch = useCallback(
    (openepdId: string, selectedMaterials: string[]) => {
      if (selectedMaterials.length === 0) return

      handleMatch(selectedMaterials, openepdId)

      // Trigger confetti for successful match
      if (selectedMaterials.length >= 3) {
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
      } else {
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
      }
    },
    [handleMatch]
  )

  const handleShowPreview = useCallback(async () => {
    setIsMatchingInProgress(true)
    try {
      const changes = await getPreviewChanges()
      setPreviewChanges(changes as IMaterialChange[])
      setShowPreview(true)
    } catch (error) {
      console.error('Failed to prepare preview:', error)
      toast({
        title: 'Error',
        description: 'Failed to prepare preview. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsMatchingInProgress(false)
    }
  }, [])

  const handleCancelMatch = useCallback(() => {
    setShowPreview(false)
  }, [])

  const handleConfirmMatch = useCallback(
    (changesWithDensity: IMaterialChange[]) => {
      matchMutation.mutate(changesWithDensity)
    },
    [matchMutation]
  )

  const getMatchingProgress = useCallback(
    (materials: any[]) => {
      const totalMaterials = materials.length
      const matchedCount = materials.filter(
        material => temporaryMatches[material._id] || material.openepdMatchId
      ).length
      return {
        totalMaterials,
        matchedCount,
        percentage: (matchedCount / totalMaterials) * 100,
      }
    },
    [temporaryMatches]
  )

  return {
    // State
    temporaryMatches,
    isMatchingInProgress,
    previewChanges,
    showPreview,
    autoSuggestedMatches,

    // Actions
    handleMatch,
    handleBulkMatch,
    handleShowPreview,
    handleCancelMatch,
    handleConfirmMatch,
    getMatchingProgress,

    // Mutations
    matchMutation,
  }
}
