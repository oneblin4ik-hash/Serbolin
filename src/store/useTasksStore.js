import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';
import { todayKey } from '../lib/dates';

export const useTasksStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
      lastResetKey: todayKey(),

      // ---------- TASKS ----------
      addTask: ({ title, xp = 20, category = 'discipline', recurring = null, note = '' }) => {
        if (!title?.trim()) return;
        const task = {
          id: nanoid(),
          title: title.trim(),
          note,
          xp,
          category,
          recurring, // null | 'daily'
          completedAt: null,
          createdAt: Date.now(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
      },

      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        if (task.completedAt) {
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, completedAt: null } : t)),
          }));
          return;
        }
        const result = useCharacterStore.getState().addXp(task.xp, task.category);
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completedAt: Date.now() } : t)),
        }));
        useUiStore.getState().showXpPopup(result.gained);
        if (result.leveledUp) {
          useUiStore.getState().toast(`Новый уровень: ${result.newLevel}!`, 'success');
        }
      },

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      // ---------- GOALS ----------
      addGoal: ({ title, note = '', steps = [] }) => {
        if (!title?.trim()) return;
        const goal = {
          id: nanoid(),
          title: title.trim(),
          note,
          steps: steps.map((s) => ({
            id: nanoid(),
            title: typeof s === 'string' ? s : s.title,
            xp: 25,
            completedAt: null,
          })),
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
            goals: s.goals.map((g) =>
              g.id !== goalId
                ? g
                : {
                    ...g,
                    steps: g.steps.map((x) =>
                      x.id === stepId ? { ...x, completedAt: null } : x
                    ),
                  }
            ),
          }));
          return;
        }
        const result = useCharacterStore.getState().addXp(step.xp, 'willpower');
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id !== goalId
              ? g
              : {
                  ...g,
                  steps: g.steps.map((x) =>
                    x.id === stepId ? { ...x, completedAt: Date.now() } : x
                  ),
                }
          ),
        }));
        useUiStore.getState().showXpPopup(result.gained);
        if (result.leveledUp) {
          useUiStore.getState().toast(`Новый уровень: ${result.newLevel}!`, 'success');
        }
      },

      addGoalStep: (goalId, title) => {
        if (!title?.trim()) return;
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id !== goalId
              ? g
              : {
                  ...g,
                  steps: [
                    ...g.steps,
                    { id: nanoid(), title: title.trim(), xp: 25, completedAt: null },
                  ],
                }
          ),
        }));
      },

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // ---------- DAILY RESET ----------
      resetDailyIfNeeded: () => {
        const key = todayKey();
        if (get().lastResetKey === key) return;
        set((s) => ({
          lastResetKey: key,
          tasks: s.tasks.map((t) =>
            t.recurring === 'daily' ? { ...t, completedAt: null } : t
          ),
        }));
      },
    }),
    { name: 'sss.tasks.v1' }
  )
);
