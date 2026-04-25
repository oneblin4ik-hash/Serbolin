import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { useWalletStore } from './useWalletStore';

export const CRM_STAGES = [
  { id: 'lead',  label: 'Лид',        color: '#888' },
  { id: 'call',  label: 'Созвон',     color: '#14B8A6' },
  { id: 'paid',  label: 'Оплачено',   color: '#D4A843' },
  { id: 'done',  label: 'Завершено',  color: '#43A047' },
];

export const useCrmStore = create(
  persist(
    (set, get) => ({
      leads: [],
      // lead: { id, name, phone, amount, stage, next, note, createdAt }

      addLead: (data) => {
        const entry = { id: nanoid(), stage: 'lead', amount: 0, createdAt: Date.now(), ...data };
        set((s) => ({ leads: [entry, ...s.leads] }));
        get()._sync(entry);
      },

      updateLead: (id, patch) => {
        set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, ...patch } : l) }));
        const updated = get().leads.find((l) => l.id === id);
        if (updated) get()._sync(updated);
      },

      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),

      moveLead: (id, stage) => {
        set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, stage } : l) }));
        const lead = get().leads.find((l) => l.id === id);
        if (lead) get()._sync({ ...lead, stage });

        // Auto-add to wallet when moved to 'paid'
        if (stage === 'paid') {
          const lead = get().leads.find((l) => l.id === id);
          if (lead && lead.amount > 0) {
            useWalletStore.getState().addEntry({
              type: 'income',
              cat: 'Клиент',
              amount: lead.amount,
              note: `${lead.name} — оплата`,
            });
          }
        }
      },

      _sync: async (entry) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_crm_leads').upsert({ ...entry, user_id: session.user.id });
      },
    }),
    { name: 'sss.crm.v2' }
  )
);
