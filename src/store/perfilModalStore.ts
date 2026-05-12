import { create } from 'zustand'

interface PerfilModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const usePerfilModal = create<PerfilModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
