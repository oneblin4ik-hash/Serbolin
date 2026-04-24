import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { XP_REWARDS } from '../lib/constants';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';
import { useAchievementsStore } from './useAchievementsStore';

// Fields that affect mass-gain progress (waist is excluded)
const MASS_FIELDS = ['weight', 'chest', 'bicep', 'hip', 'thigh'];

export const useBodyStore = create(
  persist(
    (set, get) => ({
      measurements: [], // [{ id, date, weight, chest, waist, hip, thigh, bicep, note }]
      goals: { weight: null, chest: null, bicep: null, hip: null, thigh: null },
      baselineMeasurement: null, // first ever measurement for delta achievements

      addMeasurement: (data) => {
        const entry = { id: nanoid(), ...data, date: data.date || new Date().toISOString().slice(0,10), createdAt: Date.now() };
        const prev  = get().measurements;
        const isFirst = prev.length === 0;

        set((s) => ({
          measurements: [entry, ...s.measurements],
          baselineMeasurement: isFirst ? entry : s.baselineMeasurement,
        }));

        // Base XP for logging
        const charStore = useCharacterStore.getState();
        const result = charStore.addXp(XP_REWARDS.BODY_MEAS, 'energy');
        useUiStore.getState().showXpPopup(result.amount, result.multiplier);

        // Progress XP: compare to previous measurement (mass gain only)
        if (prev.length > 0) {
          const last = prev[0];
          let gained = false;
          MASS_FIELDS.forEach((f) => {
            const cur = parseFloat(entry[f]);
            const old = parseFloat(last[f]);
            if (!isNaN(cur) && !isNaN(old) && cur > old) gained = true;
          });
          if (gained) {
            const r2 = charStore.addXp(XP_REWARDS.BODY_PROGRESS, 'strength');
            useUiStore.getState().showXpPopup(r2.amount, r2.multiplier);
          }
        }

        // Check achievements vs baseline
        const baseline = get().baselineMeasurement || entry;
        const achStore = useAchievementsStore.getState();
        const weightDelta  = (parseFloat(entry.weight) || 0) - (parseFloat(baseline.weight) || 0);
        const bicepDelta   = (parseFloat(entry.bicep)  || 0) - (parseFloat(baseline.bicep)  || 0);
        const chestDelta   = (parseFloat(entry.chest)  || 0) - (parseFloat(baseline.chest)  || 0);
        if (weightDelta >= 5)  achStore.unlock('weight_80');
        if (weightDelta >= 10) achStore.unlock('weight_85');
        if (bicepDelta  >= 3)  achStore.unlock('bicep_plus3');
        if (bicepDelta  >= 5)  achStore.unlock('bicep_plus5');
        if (chestDelta  >= 5)  achStore.unlock('chest_plus5');

        get()._sync(entry);
      },

      deleteMeasurement: (id) => set((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) })),

      setGoals: (goals) => set({ goals }),

      _sync: async (entry) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_body_measurements').upsert({ ...entry, user_id: session.user.id });
      },
    }),
    { name: 'sss.body.v2' }
  )
);
