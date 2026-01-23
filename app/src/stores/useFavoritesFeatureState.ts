import { create } from 'zustand'

type FavoritesFeatureState = {
  enabled: boolean
  actions: {
    enable: () => void
    disable: () => void
    toggle: () => void
  }
}

const useFavoritesFeatureStore = create<FavoritesFeatureState>((set) => ({
  enabled: false,
  actions: {
    enable: () => set({ enabled: true }),
    disable: () => set({ enabled: false }),
    toggle: () => set((state) => ({ enabled: !state.enabled })),
  },
}))

export const useFavoritesFeatureEnabled = () =>
  useFavoritesFeatureStore((state) => state.enabled)

export const useFavoritesFeatureActions = () =>
  useFavoritesFeatureStore((state) => state.actions)
