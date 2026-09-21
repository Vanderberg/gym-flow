import { create } from 'zustand';
import type { WorkoutScreenView } from '../domain/workout/types';

/** Estado só de UI: o SQLite é a fonte de verdade. */
export interface WorkoutState {
  view: WorkoutScreenView | null;
  status: 'loading' | 'ready' | 'error' | 'noSession';
  expanded: Record<number, boolean>;
  drafts: Record<number, string>;
  cardErrors: Record<number, string>;
  setView(view: WorkoutScreenView): void;
  setStatus(status: WorkoutState['status']): void;
  toggleExpanded(exerciseId: number, current: boolean): void;
  setDraft(exerciseId: number, text: string): void;
  clearDraft(exerciseId: number): void;
  setCardError(exerciseId: number, message: string): void;
  clearCardError(exerciseId: number): void;
  reset(): void;
}

function omit<V>(rec: Record<number, V>, key: number): Record<number, V> {
  const next = { ...rec };
  delete next[key];
  return next;
}

function keepOnly<V>(rec: Record<number, V>, ids: Set<number>): Record<number, V> {
  return Object.fromEntries(Object.entries(rec).filter(([k]) => ids.has(Number(k))));
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  view: null,
  status: 'loading',
  expanded: {},
  drafts: {},
  cardErrors: {},
  setView: (view) =>
    set((s) => {
      const ids = new Set(view.items.map((i) => i.exerciseId));
      return {
        view,
        status: 'ready',
        drafts: keepOnly(s.drafts, ids),
        cardErrors: keepOnly(s.cardErrors, ids),
        expanded: keepOnly(s.expanded, ids),
      };
    }),
  setStatus: (status) => set({ status }),
  toggleExpanded: (id, current) => set((s) => ({ expanded: { ...s.expanded, [id]: !current } })),
  setDraft: (id, text) => set((s) => ({ drafts: { ...s.drafts, [id]: text } })),
  clearDraft: (id) => set((s) => ({ drafts: omit(s.drafts, id) })),
  setCardError: (id, message) => set((s) => ({ cardErrors: { ...s.cardErrors, [id]: message } })),
  clearCardError: (id) => set((s) => ({ cardErrors: omit(s.cardErrors, id) })),
  reset: () => set({ view: null, status: 'loading', expanded: {}, drafts: {}, cardErrors: {} }),
}));
