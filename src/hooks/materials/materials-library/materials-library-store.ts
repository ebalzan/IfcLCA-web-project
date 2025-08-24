import { Types } from 'mongoose'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import { MaterialsLibraryStoreActions } from './interfaces/MaterialsLibraryStoreActions'
import { MaterialsLibraryStoreState } from './interfaces/MaterialsLibraryStoreState'

const initialState: MaterialsLibraryStoreState = {
  selectedProject: 'all',
  temporaryMatches: [],
  isOpenConfirmMatchesModal: false,
  autoSuggestedMatches: [],
  ifcSearchValue: '',
  ec3SearchValue: '',
  isAutoScrollEnabled: false,
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

      setIsAutoScrollEnabled: (isAutoScrollEnabled: boolean) => {
        set({ isAutoScrollEnabled })
      },

      confirmMatches: () => {
        set({ isOpenConfirmMatchesModal: false, temporaryMatches: [] })
      },

      acceptMatch: (match: Omit<IEC3Match, '_id'>) => {
        const { temporaryMatches } = get()
        const newMatches = [...temporaryMatches]
        const { materialId, ec3MatchId } = match
        newMatches.push({
          materialId,
          ec3MatchId,
        })
        set({ temporaryMatches: newMatches })
      },

      acceptAllMatches: () => {
        const { autoSuggestedMatches, temporaryMatches } = get()
        const newMatches = [...temporaryMatches]
        autoSuggestedMatches.forEach(match => {
          newMatches.push({
            materialId: new Types.ObjectId(match.materialId),
            ec3MatchId: match.ec3MatchId,
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
