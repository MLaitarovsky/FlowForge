import { create } from 'zustand'

interface UIState {
  configPanelOpen: boolean
  setConfigPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  configPanelOpen: false,
  setConfigPanelOpen: (open) => set({ configPanelOpen: open }),
}))
