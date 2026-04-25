import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';

export const useWalletStore = create(
  persist(
    (set, get) => ({
      balance: 0,
      goal: 100000,
      entries: [],
      // entry: { id, type: 'income'|'expense', cat, amount, note, date, createdAt }

      addEntry: ({ type, cat, amount, note = '', date }) => {
        const entry = {
          id: nanoid(),
          type,
          cat,
          amount: parseInt(amount),
          note,
          date: date || new Date().toISOString().slice(0, 10),
          createdAt: Date.now(),
        };
        set((s) => ({
          balance: s.balance + (type === 'income' ? entry.amount : -entry.amount),
          entries: [entry, ...s.entries],
        }));
        get()._sync();
      },

      deleteEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;
        set((s) => ({
          balance: s.balance - (entry.type === 'income' ? entry.amount : -entry.amount),
          entries: s.entries.filter((e) => e.id !== id),
        }));
        get()._sync();
      },

      setGoal: (goal) => { set({ goal }); get()._sync(); },

      _sync: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { balance, goal, entries } = get();
        await supabase.from('v2_wallet').upsert({ user_id: session.user.id, balance, goal, entries });
      },
    }),
    { name: 'sss.wallet.v2' }
  )
);
