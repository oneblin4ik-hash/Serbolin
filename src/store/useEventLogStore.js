import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export const useEventLogStore = create(
  persist(
    (set) => ({
      events: [],
      // event: { id, ts, message, xp, type }

      log: (message, xp = null) => {
        const event = { id: nanoid(), ts: Date.now(), message, xp };
        set((s) => ({ events: [event, ...s.events].slice(0, 200) }));
      },
    }),
    { name: 'sss.eventlog.v2' }
  )
);
