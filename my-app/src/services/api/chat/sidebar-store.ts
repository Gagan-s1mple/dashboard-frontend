import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));