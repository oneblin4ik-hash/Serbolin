import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelFromXp, getRank, applyXp } from '../lib/xp';
import { STATS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { todayKey } from '../lib/dates';

const initialStats = Object.fromEntries(STATS.map((s) => [s.key, 0]));

export const useCharacterStore = create(
  persist(
    (set, get) => ({
      name:       'Эдуард',
      avatar:     null,
      totalXp:    0,
      stats:      initialStats,
      streakDays: 0,
      lastQuestDay: null,
      brand: null,

      // XP + streak
      addXp: (baseAmount, statKey = null) => {
        const { totalXp, streakDays } = get();
        const { amount, multiplier, bonus } = applyXp(baseAmount, streakDays);

        const levelBefore = getLevelFromXp(totalXp);
        const newTotal    = totalXp + amount;
        const levelAfter  = getLevelFromXp(newTotal);

        set((s) => ({
          totalXp: newTotal,
          stats: statKey
            ? { ...s.stats, [statKey]: (s.stats[statKey] || 0) + 1 }
            : s.stats,
        }));

        get()._syncStats();

        return {
          amount,
          multiplier,
          bonus,
          leveledUp: levelAfter > levelBefore,
          newLevel:  levelAfter,
          newRank:   getRank(levelAfter),
        };
      },

      // Call when any quest/task is completed today to keep streak alive
      touchStreak: () => {
        const today = todayKey();
        const { lastQuestDay, streakDays } = get();
        if (lastQuestDay === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        const newStreak = lastQuestDay === yKey ? streakDays + 1 : 1;

        set({ streakDays: newStreak, lastQuestDay: today });
        get()._syncStats();
      },

      rename:    (name)   => { set({ name: name.trim() || 'Без имени' }); get()._syncStats(); },
      setAvatar: (url)    => { set({ avatar: url || null });               get()._syncStats(); },
      setBrand:  (brand)  => set({ brand }),

      // Load from Supabase
      load: async (userId) => {
        const { data } = await supabase
          .from('v2_player_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          set({
            name:         data.name         || 'Эдуард',
            avatar:       data.avatar_url   || null,
            totalXp:      data.total_xp     || 0,
            stats:        data.stats        || initialStats,
            streakDays:   data.streak_days  || 0,
            lastQuestDay: data.last_quest_day || null,
          });
        }
      },

      _syncStats: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { name, avatar, totalXp, stats, streakDays, lastQuestDay } = get();
        await supabase.from('v2_player_stats').upsert({
          user_id:       session.user.id,
          name,
          avatar_url:    avatar,
          total_xp:      totalXp,
          stats,
          streak_days:   streakDays,
          last_quest_day: lastQuestDay,
          updated_at:    new Date().toISOString(),
        }, { onConflict: 'user_id' });
      },
    }),
    { name: 'sss.character.v2' }
  )
);
