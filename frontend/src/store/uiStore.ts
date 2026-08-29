import { create } from "zustand";

interface UIState {
  sidebarCollapsedDesktop: boolean;
  sidebarOpenMobile: boolean;
  categoriesModalOpen: boolean;
  notificationsModalOpen: boolean;
  tagsModalOpen: boolean;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
  setCategoriesModal: (open: boolean) => void;
  setNotificationsModal: (open: boolean) => void;
  setTagsModal: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsedDesktop: false,
  sidebarOpenMobile: false,
  categoriesModalOpen: false,
  notificationsModalOpen: false,
  tagsModalOpen: false,
  toggleSidebar: () => {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      set({ sidebarCollapsedDesktop: !get().sidebarCollapsedDesktop });
    } else {
      set({ sidebarOpenMobile: !get().sidebarOpenMobile });
    }
  },
  closeMobileSidebar: () => set({ sidebarOpenMobile: false }),
  setCategoriesModal: (open) => set({ categoriesModalOpen: open }),
  setNotificationsModal: (open) => set({ notificationsModalOpen: open }),
  setTagsModal: (open) => set({ tagsModalOpen: open }),
}));