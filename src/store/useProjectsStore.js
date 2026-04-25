import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { useAchievementsStore } from './useAchievementsStore';

export const useProjectsStore = create(
  persist(
    (set, get) => ({
      projects: [],
      // project: { id, title, description, status, progress, deadline, tags[], createdAt }

      addProject: (data) => {
        const entry = { id: nanoid(), progress: 0, status: 'active', tags: [], createdAt: Date.now(), ...data };
        set((s) => ({ projects: [entry, ...s.projects] }));
        if (get().projects.length >= 1) useAchievementsStore.getState().unlock('first_project');
        get()._sync(entry);
      },

      updateProject: (id, patch) => {
        set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...patch } : p) }));
        const updated = get().projects.find((p) => p.id === id);
        if (updated) get()._sync(updated);
      },

      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      _sync: async (entry) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_projects').upsert({ ...entry, user_id: session.user.id });
      },
    }),
    { name: 'sss.projects.v2' }
  )
);
