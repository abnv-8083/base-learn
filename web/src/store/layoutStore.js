import { create } from 'zustand';

// Helper to sync body class for overflow locking
function syncBodyClass(isOpen) {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('sidebar-open', isOpen);
  }
}

export const useLayoutStore = create((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => {
    const next = !state.isSidebarOpen;
    syncBodyClass(next);
    return { isSidebarOpen: next };
  }),
  setSidebarOpen: (isOpen) => {
    syncBodyClass(isOpen);
    set({ isSidebarOpen: isOpen });
  },
}));
