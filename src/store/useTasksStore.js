import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { todayKey } from '../lib/dates';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';
import { useAchievementsStore } from './useAchievementsStore';

export const useTasksStore = create(
  persist(
    (set, get) => ({
      tasks:        [],
      goals:        [],
      lastResetKey: todayKey(),

      // ── Tasks ──────────────────────────────────────────────────────────────
      addTask: ({ title, xp = 20, statKey = 'discipline', recurring = null, note = '' }) => {
        if (!title?.trim()) return;
        const task = { id: nanoid(), title: title.trim(), note, xp, statKey, recurring, completedAt: null, createdAt: Date.now() };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        get()._syncTask(task);
      },

      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        if (task.completedAt) {
          set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, completedAt: null } : t) }));
          return;
        }

        const charStore = useCharacterStore.getState();
        const result = charStore.addXp(task.xp, task.statKey);
        charStore.touchStreak();

        set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, completedAt: Date.now() } : t) }));

        useUiStore.getState().showXpPopup(result.amount, result.multiplier);
        if (result.leveledUp) useUiStore.getState().showLevelUp(result.newLevel, result.newRank);

        useAchievementsStore.getState().checkAfterTaskComplete(get().tasks);
      },

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ── Goals ──────────────────────────────────────────────────────────────
      addGoal: ({ title, note = '', steps = [] }) => {
        if (!title?.trim()) return;
        const goal = {
          id: nanoid(),
          title: title.trim(),
          note,
          steps: steps.map((s) => ({ id: nanoid(), title: typeof s === 'string' ? s : s.title, xp: 25, completedAt: null })),
          createdAt: Date.now(),
        };
        set((s) => ({ goals: [goal, ...s.goals] }));
      },

      toggleGoalStep: (goalId, stepId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        const step = goal?.steps.find((s) => s.id === stepId);
        if (!goal || !step) return;

        if (step.completedAt) {
          set((s) => ({
            goals: s.goals.map((g) => g.id !== goalId ? g : {
              ...g, steps: g.steps.map((x) => x.id === stepId ? { ...x, completedAt: null } : x),
            }),
          }));
          return;
        }

        const result = useCharacterStore.getState().addXp(step.xp, 'discipline');
        useCharacterStore.getState().touchStreak();

        set((s) => ({
          goals: s.goals.map((g) => g.id !== goalId ? g : {
            ...g, steps: g.steps.map((x) => x.id === stepId ? { ...x, completedAt: Date.now() } : x),
          }),
        }));

        useUiStore.getState().showXpPopup(result.amount, result.multiplier);
        if (result.leveledUp) useUiStore.getState().showLevelUp(result.newLevel, result.newRank);
      },

      addGoalStep: (goalId, title) => {
        if (!title?.trim()) return;
        set((s) => ({
          goals: s.goals.map((g) => g.id !== goalId ? g : {
            ...g, steps: [...g.steps, { id: nanoid(), title: title.trim(), xp: 25, completedAt: null }],
          }),
        }));
      },

      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // ── Daily reset ────────────────────────────────────────────────────────
      resetDailyIfNeeded: () => {
        const key = todayKey();
        if (get().lastResetKey === key) return;
        set((s) => ({
          lastResetKey: key,
          tasks: s.tasks.map((t) => t.recurring === 'daily' ? { ...t, completedAt: null } : t),
        }));
      },

      _syncTask: async (task) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_tasks').upsert({ ...task, user_id: session.user.id });
      },
    }),
    { name: 'sss.tasks.v2' }
  )
);
