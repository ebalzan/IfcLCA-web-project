import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AutoSuggestedMatch } from '@/components/materials-library/materials-library-ifc-box/materials-library-card/AutoSuggestedMatch'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'

interface MaterialsLibraryStore {
  // Materials Library State
  selectedProject: string
  searchValue: string
  selectedMaterials: IMaterialClient[]
  materialsCount: number
  filteredMaterials: IMaterialClient[]

  // Material Matching State
  temporaryMatches: Record<string, string>
  isMatchingInProgress: boolean
  isOpenMaterialChangesModal: boolean
  autoSuggestedMatches: Record<string, AutoSuggestedMatch>

  // Actions - Materials Library
  setSelectedProject: (projectId: string) => void
  setSearchValue: (value: string) => void
  updateMaterials: (projectsWithStats: IProjectWithNestedDataClient[] | null) => void
  openMaterialChangesModal: () => void
  closeMaterialChangesModal: () => void

  // Actions - Material Matching
  setTemporaryMatches: (materialIds: string[], openEPDId: string | null) => void
  setIsMatchingInProgress: (isMatchingInProgress: boolean) => void
  confirmMatches: () => void
  acceptMatch: (openEPDId: string, selectedMaterialId: string) => void
  acceptAllMatches: (openEPDId: string) => void
  cancelMatch: () => void

  // Utility
  resetState: () => void
}

const initialState = {
  // Materials Library State
  selectedProject: 'all',
  searchValue: '',
  selectedMaterials: [],
  materialsCount: 0,
  filteredMaterials: [],

  // Material Matching State
  temporaryMatches: {},
  isMatchingInProgress: false,
  isOpenMaterialChangesModal: false,
  autoSuggestedMatches: {},
}

export const useMaterialsLibraryStore = create<MaterialsLibraryStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Actions - Materials Library
      setSelectedProject: (projectId: string) => {
        const { searchValue } = get()
        const newSelectedProject = projectId === 'all' ? 'all' : projectId

        set({ selectedProject: newSelectedProject })

        // Recalculate materials when project changes
        get().updateMaterials(null) // This will be called with actual data from the hook
      },

      setSearchValue: (value: string) => {
        const { selectedMaterials } = get()

        set({ searchValue: value })

        // Recalculate filtered materials when search changes
        const filteredMaterials = value.trim()
          ? selectedMaterials.filter(material => {
              const searchTerm = value.toLowerCase()
              return (
                material.name.toLowerCase().includes(searchTerm) ||
                material.category?.toLowerCase().includes(searchTerm) ||
                material.name.toLowerCase().includes(searchTerm)
              )
            })
          : selectedMaterials

        set({ filteredMaterials })
      },

      updateMaterials: (projectsWithStats: IProjectWithNestedDataClient[] | null) => {
        const { selectedProject, searchValue } = get()

        if (!projectsWithStats) {
          set({
            selectedMaterials: [],
            materialsCount: 0,
            filteredMaterials: [],
          })
          return
        }

        // Calculate materials count
        const materialsCount = projectsWithStats.reduce(
          (acc, page) => acc + page._count.materials,
          0
        )

        // Calculate selected materials
        const selectedMaterials =
          selectedProject === 'all'
            ? projectsWithStats.map(page => page.materials).flat()
            : projectsWithStats.find(page => page._id === selectedProject)?.materials || []

        // Calculate filtered materials
        const filteredMaterials = searchValue.trim()
          ? selectedMaterials.filter(material => {
              const searchTerm = searchValue.toLowerCase()
              return (
                material.name.toLowerCase().includes(searchTerm) ||
                material.category?.toLowerCase().includes(searchTerm) ||
                material.name.toLowerCase().includes(searchTerm)
              )
            })
          : selectedMaterials

        set({
          selectedMaterials,
          materialsCount,
          filteredMaterials,
        })
      },

      openMaterialChangesModal: () => {
        set({ isOpenMaterialChangesModal: true })
      },

      closeMaterialChangesModal: () => {
        set({ isOpenMaterialChangesModal: false })
      },

      // Actions - Material Matching
      setTemporaryMatches: (materialIds: string[], openEPDId: string | null) => {
        const { temporaryMatches } = get()
        const newMatches = { ...temporaryMatches }

        materialIds.forEach(id => {
          if (openEPDId) {
            newMatches[id] = openEPDId
          } else {
            delete newMatches[id]
          }
        })

        set({ temporaryMatches: newMatches })
      },

      setIsMatchingInProgress: (isMatchingInProgress: boolean) => {
        set({ isMatchingInProgress })
      },

      confirmMatches: () => {
        // This will be handled by the mutation in the component
        // The store just provides the state management
        set({ isOpenMaterialChangesModal: false, temporaryMatches: {} })
      },

      acceptMatch: (openEPDId: string, selectedMaterialId: string) => {
        if (!selectedMaterialId) return

        get().setTemporaryMatches([selectedMaterialId], openEPDId)

        // Note: Confetti logic will be handled in the component since it's UI-specific
        // and requires browser APIs
      },

      acceptAllMatches: (openEPDId: string) => {
        const { temporaryMatches } = get()
        const materialIds = Object.keys(temporaryMatches)
        get().setTemporaryMatches(materialIds, openEPDId)
      },

      cancelMatch: () => {
        set({ isOpenMaterialChangesModal: false })
      },

      resetState: () => {
        set(initialState)
      },
    }),
    {
      name: 'materials-library-store',
    }
  )
)
