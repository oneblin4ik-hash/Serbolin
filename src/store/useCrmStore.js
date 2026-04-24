import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';

export const useCrmStore = create(
  persist(
    (set, get) => ({
      clients: [],
      // client: { id, name, phone, telegram, city, goal, level, monthlyAmount, note, payments[], createdAt }

      addClient: (data) => {
        const entry = { id: nanoid(), payments: [], createdAt: Date.now(), ...data };
        set((s) => ({ clients: [entry, ...s.clients] }));
        get()._sync(entry);
      },

      updateClient: (id, patch) => {
        set((s) => ({ clients: s.clients.map((c) => c.id === id ? { ...c, ...patch } : c) }));
        const updated = get().clients.find((c) => c.id === id);
        if (updated) get()._sync(updated);
      },

      deleteClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      addPayment: (clientId, { amount, date, note = '' }) => {
        const payment = { id: nanoid(), amount: parseFloat(amount), date: date || new Date().toISOString().slice(0, 10), note, createdAt: Date.now() };
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === clientId ? { ...c, payments: [payment, ...(c.payments || [])] } : c
          ),
        }));
        const updated = get().clients.find((c) => c.id === clientId);
        if (updated) get()._sync(updated);
      },

      deletePayment: (clientId, paymentId) => {
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === clientId ? { ...c, payments: (c.payments || []).filter((p) => p.id !== paymentId) } : c
          ),
        }));
        const updated = get().clients.find((c) => c.id === clientId);
        if (updated) get()._sync(updated);
      },

      _sync: async (entry) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_crm_clients').upsert({ ...entry, user_id: session.user.id });
      },
    }),
    { name: 'sss.crm.v2' }
  )
);
