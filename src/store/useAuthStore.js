import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  session: null,
  user:    null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  },

  signup: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
