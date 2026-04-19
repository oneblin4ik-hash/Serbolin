import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useUiStore = create((set, get) => ({
  modal: null, // { title, content }
  toasts: [],
  xpPopup: null, // { id, amount }
  sidebarOpen: false,

  openModal: (title, content) => set({ modal: { title, content } }),
  closeModal: () => set({ modal: null }),

  toast: (message, kind = 'info', ms = 3000) => {
    const id = nanoid();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, ms);
  },

  showXpPopup: (amount) => {
    const id = nanoid();
    set({ xpPopup: { id, amount } });
    setTimeout(() => {
      if (get().xpPopup?.id === id) set({ xpPopup: null });
    }, 1500);
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
