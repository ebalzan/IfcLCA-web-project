import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MaterialsLibraryStoreActions } from './interfaces/MaterialsLibraryStoreActions'
import { MaterialsLibraryStoreState } from './interfaces/MaterialsLibraryStoreState'
import { TemporaryMatch } from './interfaces/TemporaryMatch'

const initialState: MaterialsLibraryStoreState = {
  selectedProject: 'all',
  temporaryMatches: [],
  selectedMaterials: [],
  matchingProgress: {
    matchedCount: 0,
    percentage: 0,
  },
  isSelectAllChecked: false,
  isOpenConfirmMatchesModal: false,
  autoSuggestedMatches: [],
  ifcSearchValue: '',
  isAutoScrollEnabled: false,
  ec3SearchValue: '',
  ec3SearchFields: [
    'id',
    'name',
    'manufacturer',
    'category',
    'description',
    'gwp',
    'ubp',
    'penre',
    'density',
    'declared_unit',
  ],
  ec3SearchSortBy: '+name',
}

export const useMaterialsLibraryStore = create<
  MaterialsLibraryStoreState & MaterialsLibraryStoreActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSelectedProject: (projectId: string) => {
        set({ selectedProject: projectId })
      },

      setIfcSearchValue: (value: string) => {
        set({ ifcSearchValue: value })
      },

      setEc3SearchValue: (value: string) => {
        set({ ec3SearchValue: value })
      },

      setEc3SearchFields: (fields: string[]) => {
        set({ ec3SearchFields: fields })
      },

      setEc3SearchSortBy: (sortBy: string) => {
        set({ ec3SearchSortBy: sortBy })
      },

      setIsAutoScrollEnabled: (isAutoScrollEnabled: boolean) => {
        set({ isAutoScrollEnabled })
      },

      setSelectedMaterials: (materials: string[]) => {
        set({ selectedMaterials: materials })
      },

      setIsSelectAllChecked: (isSelectAllChecked: boolean) => {
        set({ isSelectAllChecked })
      },

      setTemporaryMatches: (matches: TemporaryMatch[]) => {
        set({ temporaryMatches: matches })
      },

      openConfirmMatchesModal: () => {
        set({ isOpenConfirmMatchesModal: true })
      },

      closeConfirmMatchesModal: () => {
        set({ isOpenConfirmMatchesModal: false })
      },

      setMatchingProgress: (progress: { matchedCount: number; percentage: number }) => {
        set({ matchingProgress: progress })
      },

      resetState: () => set(initialState),
    }),
    {
      name: 'materials-library-store',
    }
  )
)
