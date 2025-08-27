import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { IEC3MatchClient } from '@/interfaces/client/materials/IEC3MatchClient'
import { MaterialsLibraryStoreActions } from './interfaces/MaterialsLibraryStoreActions'
import { MaterialsLibraryStoreState } from './interfaces/MaterialsLibraryStoreState'

const initialState: MaterialsLibraryStoreState = {
  selectedProject: 'all',
  temporaryMatches: [],
  selectedMaterials: [],
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
        const newSelectedProject = projectId === 'all' ? 'all' : projectId

        set({ selectedProject: newSelectedProject })
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

      confirmMatches: () => {
        set({ isOpenConfirmMatchesModal: false, temporaryMatches: [] })
      },

      acceptMatch: (match: Omit<IEC3MatchClient, '_id'>) => {
        const { temporaryMatches } = get()
        const newMatches = [...temporaryMatches]
        newMatches.push(match)
        set({ temporaryMatches: newMatches })
      },

      acceptAllMatches: () => {
        const { autoSuggestedMatches, temporaryMatches } = get()
        const newMatches = [...temporaryMatches]
        autoSuggestedMatches.forEach(match => {
          newMatches.push({
            ...match,
            autoMatched: false,
          })
        })
        set({ temporaryMatches: newMatches })
      },

      cancelMatch: () => {
        set({ isOpenConfirmMatchesModal: false })
      },

      openConfirmMatchesModal: () => {
        set({ isOpenConfirmMatchesModal: true })
      },

      closeConfirmMatchesModal: () => {
        set({ isOpenConfirmMatchesModal: false })
      },

      resetState: () => set(initialState),
    }),
    {
      name: 'materials-library-store',
    }
  )
)
