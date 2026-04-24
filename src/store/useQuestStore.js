import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { QUEST_POOLS, BOSS_TEMPLATES, BRANCHES } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { todayKey, weekKey } from '../lib/dates';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';
import { useAchievementsStore } from './useAchievementsStore';

function generateDailyQuests(dateKey) {
  const all = [];
  Object.entries(QUEST_POOLS).forEach(([branch, pool]) => {
    const idx = parseInt(dateKey.replace(/-/g, ''), 10) % pool.length;
    const quest = pool[idx];
    all.push({ id: nanoid(), branch, title: quest.title, xp: quest.xp, difficulty: quest.difficulty, completedAt: null, isCustom: false, dateKey });
  });
  return all.slice(0, 4); // show 4 auto quests per day
}

function pickBoss(weekK) {
  const idx = parseInt(weekK.replace(/[^0-9]/g, ''), 10) % BOSS_TEMPLATES.length;
  const t = BOSS_TEMPLATES[idx];
  return { id: nanoid(), weekKey: weekK, ...t, progress: {}, completedAt: null };
}

export const useQuestStore = create(
  persist(
    (set, get) => ({
      quests:      [],
      boss:        null,
      lastQuestDay: null,
      lastBossWeek: null,

      init: () => {
        const today = todayKey();
        const week  = weekKey();

        if (get().lastQuestDay !== today) {
          const daily = generateDailyQuests(today);
          set({ quests: [...get().quests.filter((q) => q.isCustom), ...daily], lastQuestDay: today });
        }
        if (get().lastBossWeek !== week) {
          set({ boss: pickBoss(week), lastBossWeek: week });
        }
      },

      toggleQuest: (id) => {
        const quest = get().quests.find((q) => q.id === id);
        if (!quest) return;

        if (quest.completedAt) {
          set((s) => ({ quests: s.quests.map((q) => q.id === id ? { ...q, completedAt: null } : q) }));
          return;
        }

        const branch  = BRANCHES[quest.branch];
        const charStore = useCharacterStore.getState();
        const result  = charStore.addXp(quest.xp, branch?.stat);
        charStore.touchStreak();

        set((s) => ({ quests: s.quests.map((q) => q.id === id ? { ...q, completedAt: Date.now() } : q) }));

        useUiStore.getState().showXpPopup(result.amount, result.multiplier);
        if (result.leveledUp) useUiStore.getState().showLevelUp(result.newLevel, result.newRank);

        const ach = useAchievementsStore.getState();
        ach.checkStreak(charStore.streakDays);
        ach.checkLevel(result.newLevel);

        // Check perfect week
        const todayDone = get().quests.filter((q) => q.completedAt && q.dateKey === todayKey()).length;
        if (todayDone >= 3) ach.unlock('perfect_week');

        // Boss progress
        get()._bumpBossProgress();
        get()._syncQuest({ ...quest, completedAt: Date.now() });
      },

      addCustomQuest: ({ title, xp = 30, branch = 'CUSTOM' }) => {
        if (!title?.trim()) return;
        const quest = { id: nanoid(), branch, title: title.trim(), xp, difficulty: 'medium', completedAt: null, isCustom: true, dateKey: todayKey() };
        set((s) => ({ quests: [quest, ...s.quests] }));
      },

      updateQuest: (id, patch) => {
        set((s) => ({ quests: s.quests.map((q) => q.id === id ? { ...q, ...patch } : q) }));
        const updated = get().quests.find((q) => q.id === id);
        if (updated) get()._syncQuest(updated);
      },

      deleteQuest: (id) => set((s) => ({ quests: s.quests.filter((q) => q.id !== id) })),

      _bumpBossProgress: () => {
        const { boss, quests } = get();
        if (!boss || boss.completedAt) return;
        const completed = quests.filter((q) => q.completedAt).length;
        const targets   = boss.targets;
        const progress  = { ...boss.progress, quests: completed };
        const done = Object.entries(targets).every(([k, v]) => (progress[k] || 0) >= v);
        const updated = { ...boss, progress, completedAt: done ? Date.now() : null };
        set({ boss: updated });
        if (done) {
          const result = useCharacterStore.getState().addXp(boss.xpReward, null);
          useUiStore.getState().showXpPopup(result.amount, result.multiplier);
          useUiStore.getState().toast(`👹 Босс побеждён! +${boss.xpReward} XP`, 'success', 5000);
        }
      },

      _syncQuest: async (quest) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_quests').upsert({ ...quest, user_id: session.user.id });
      },
    }),
    { name: 'sss.quests.v2' }
  )
);
