import { create } from 'zustand'

interface SidebarState {
  isDrawerOpen: boolean
  isExpanded: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleExpanded: () => void
}

export const useSidebar = create<SidebarState>((set) => ({
  isDrawerOpen: false,
  isExpanded: true,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}))
