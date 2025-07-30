import { useCallback, useMemo, useState } from 'react'
import { useProjectsWithStats } from '@/hooks/projects/use-project-operations'
import IMaterialClient from '@/interfaces/client/materials/IMaterialClient'

export interface MaterialsLibraryState {
  selectedMaterials: IMaterialClient[]
  materialsCount: number
  selectedProject: string
  searchValue: string
  filteredMaterials: IMaterialClient[]
}

export function useMaterialsLibrary() {
  const {
    data: projectsWithStats,
    isLoading: isProjectsWithStatsLoading,
    error: projectsWithStatsError,
  } = useProjectsWithStats()

  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [searchValue, setSearchValue] = useState<string>('')

  const selectedMaterials = useMemo(() => {
    if (!projectsWithStats) return []

    if (selectedProject === 'all') {
      return projectsWithStats.map(page => page.materials).flat()
    } else {
      return projectsWithStats.find(page => page._id === selectedProject)?.materials || []
    }
  }, [projectsWithStats, selectedProject])

  const materialsCount = useMemo(() => {
    if (!projectsWithStats) return 0
    return projectsWithStats.reduce((acc, page) => acc + page._count.materials, 0)
  }, [projectsWithStats])

  const filteredMaterials = useMemo(() => {
    if (!searchValue.trim()) return selectedMaterials

    const searchTerm = searchValue.toLowerCase()
    return selectedMaterials.filter(
      material =>
        material.name.toLowerCase().includes(searchTerm) ||
        material.category?.toLowerCase().includes(searchTerm) ||
        material.name.toLowerCase().includes(searchTerm)
    )
  }, [selectedMaterials, searchValue])

  const handleProjectChange = useCallback((projectId: string) => {
    setSelectedProject(projectId === 'all' ? '' : projectId)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  return {
    // State
    selectedMaterials,
    materialsCount,
    selectedProject,
    searchValue,
    filteredMaterials,

    // Loading states
    isProjectsWithStatsLoading,
    projectsWithStatsError,

    // Actions
    handleProjectChange,
    handleSearchChange,

    // Data
    projectsWithStats,
  }
}
