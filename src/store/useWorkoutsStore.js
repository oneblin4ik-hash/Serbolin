import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';
import { useAchievementsStore } from './useAchievementsStore';
import { useEventLogStore } from './useEventLogStore';

export const useWorkoutsStore = create(
  persist(
    (set, get) => ({
      workouts: [],

      addWorkout: ({ date, title, muscleGroups = [], exercises = [], xp = 50, note = '' }) => {
        const entry = { id: nanoid(), date: date || new Date().toISOString().slice(0,10), title: title || 'Тренировка', muscleGroups, exercises, xp, note, createdAt: Date.now() };
        set((s) => ({ workouts: [entry, ...s.workouts] }));

        const charStore = useCharacterStore.getState();
        const result = charStore.addXp(xp, 'strength');
        charStore.touchStreak();
        useUiStore.getState().showXpPopup(result.amount, result.multiplier);
        if (result.leveledUp) useUiStore.getState().showLevelUp(result.newLevel, result.newRank);

        const total = get().workouts.length;
        const achStore = useAchievementsStore.getState();
        if (total >= 1)  achStore.unlock('first_workout');
        if (total >= 50) achStore.unlock('workouts_50');

        useEventLogStore.getState().log(`Тренировка «${entry.title}»`, result.amount);
        get()._sync(entry);
      },

      updateWorkout: (id, patch) => {
        set((s) => ({ workouts: s.workouts.map((w) => w.id === id ? { ...w, ...patch } : w) }));
        const updated = get().workouts.find((w) => w.id === id);
        if (updated) get()._sync(updated);
      },

      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      _sync: async (entry) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_workouts').upsert({ ...entry, user_id: session.user.id });
      },
    }),
    { name: 'sss.workouts.v2' }
  )
);
