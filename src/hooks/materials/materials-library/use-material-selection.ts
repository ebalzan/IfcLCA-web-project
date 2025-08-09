import { useCallback, useState } from 'react'
import IMaterialClient from '@/interfaces/client/materials/IMaterialClient'

export function useMaterialSelection() {
  const [selectedMaterials, setSelectedMaterials] = useState<IMaterialClient[]>([])

  const isSelected = useCallback(
    (material: IMaterialClient) => {
      return selectedMaterials.some(mat => mat._id === material._id)
    },
    [selectedMaterials]
  )

  const handleSelect = useCallback((material: IMaterialClient) => {
    setSelectedMaterials(prev => {
      const isCurrentlySelected = prev.some(mat => mat._id === material._id)
      return isCurrentlySelected
        ? prev.filter(mat => mat._id !== material._id)
        : [...prev, material]
    })
  }, [])

  const handleSelectAll = useCallback((materials: IMaterialClient[], checked: boolean) => {
    if (checked) {
      setSelectedMaterials(materials)
    } else {
      setSelectedMaterials([])
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMaterials([])
  }, [])

  return {
    selectedMaterials,
    isSelected,
    handleSelect,
    handleSelectAll,
    clearSelection,
  }
}
