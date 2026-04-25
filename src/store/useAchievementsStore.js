import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACHIEVEMENTS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';

export const useAchievementsStore = create(
  persist(
    (set, get) => ({
      unlocked: [], // array of achievement keys

      isUnlocked: (key) => get().unlocked.includes(key),

      unlock: (key) => {
        if (get().isUnlocked(key)) return;
        const def = ACHIEVEMENTS.find((a) => a.key === key);
        if (!def) return;

        set((s) => ({ unlocked: [...s.unlocked, key] }));

        useCharacterStore.getState().addXp(def.xpReward, null);
        useUiStore.getState().toast(`${def.emoji} Ачивка: ${def.title} (+${def.xpReward} XP)`, 'success', 5000);

        get()._syncUnlock(key);
      },

      checkAfterTaskComplete: (tasks) => {
        const completed = tasks.filter((t) => t.completedAt).length;
        if (completed >= 1) get().unlock('first_quest');
        if (completed >= 50) get().unlock('iron_discipline');
      },

      checkStreak: (streakDays) => {
        if (streakDays >= 3)  get().unlock('streak_3');
        if (streakDays >= 7)  get().unlock('streak_7');
        if (streakDays >= 30) get().unlock('streak_30');
      },

      checkLevel: (level) => {
        if (level >= 5)  get().unlock('level_5');
        if (level >= 10) get().unlock('level_10');
      },

      checkContent: (postsCount) => {
        if (postsCount >= 1)  get().unlock('first_post');
        if (postsCount >= 20) get().unlock('content_machine');
      },

      _syncUnlock: async (key) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_achievements').upsert(
          { user_id: session.user.id, achievement_key: key, unlocked_at: new Date().toISOString() },
          { onConflict: 'user_id,achievement_key' }
        );
      },

      load: async (userId) => {
        const { data } = await supabase.from('v2_achievements').select('achievement_key').eq('user_id', userId);
        if (data) set({ unlocked: data.map((r) => r.achievement_key) });
      },
    }),
    { name: 'sss.achievements.v2' }
  )
);
