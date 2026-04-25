import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useUiStore = create((set, get) => ({
  modal:       null,
  toasts:      [],
  xpPopup:     null,
  levelUpData: null,
  sidebarOpen: false,

  openModal:  (title, content) => set({ modal: { title, content } }),
  closeModal: () => set({ modal: null }),

  toast: (message, kind = 'info', ms = 3500) => {
    const id = nanoid();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), ms);
  },

  showXpPopup: (amount, multiplier = 1) => {
    const id = nanoid();
    set({ xpPopup: { id, amount, multiplier } });
    setTimeout(() => { if (get().xpPopup?.id === id) set({ xpPopup: null }); }, 1800);
  },

  showLevelUp: (level, rank) => {
    set({ levelUpData: { level, rank } });
    setTimeout(() => set({ levelUpData: null }), 4000);
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar:  () => set({ sidebarOpen: false }),
}));
