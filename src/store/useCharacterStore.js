import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelFromXp } from '../lib/xp';
import { STAT_CATEGORIES } from '../lib/constants';

const initialStats = Object.fromEntries(STAT_CATEGORIES.map((c) => [c.key, 0]));

export const useCharacterStore = create(
  persist(
    (set, get) => ({
      name: 'Эдуард',
      avatar: null,
      totalXp: 0,
      stats: initialStats,

      addXp: (amount, category) => {
        const before = get().totalXp;
        const after = before + amount;
        const levelBefore = getLevelFromXp(before);
        const levelAfter = getLevelFromXp(after);
        set((state) => ({
          totalXp: after,
          stats: category
            ? { ...state.stats, [category]: (state.stats[category] || 0) + amount }
            : state.stats,
        }));
        return { gained: amount, leveledUp: levelAfter > levelBefore, newLevel: levelAfter };
      },

      rename: (name) => set({ name: name.trim() || 'Без имени' }),
      setAvatar: (url) => set({ avatar: url || null }),

      reset: () =>
        set({ name: 'Эдуард', avatar: null, totalXp: 0, stats: initialStats }),
    }),
    { name: 'sss.character.v1' }
  )
);
