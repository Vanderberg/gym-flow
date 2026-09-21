import { create } from 'zustand';
import type { DetailRow } from '../domain/history/types';

/** Estado só de UI: filtro em memória e rascunho da edição. SQLite é a fonte de verdade. */
export interface HistoryState {
  programFilter: number | null;
  edit: { sessionId: number; original: DetailRow[]; draft: DetailRow[] } | null;
  invalid: Record<number, boolean>;
  setProgramFilter(id: number | null): void;
  clearProgramFilter(): void;
  startEdit(sessionId: number, rows: DetailRow[]): void;
  toggleCompleted(exerciseId: number): void;
  setWeight(exerciseId: number, weight: number | null, invalid?: boolean): void;
  cancelEdit(): void;
}

const mapRow = (rows: DetailRow[], id: number, fn: (r: DetailRow) => DetailRow) =>
  rows.map((r) => (r.exerciseId === id ? fn(r) : r));

export const useHistoryStore = create<HistoryState>((set) => ({
  programFilter: null,
  edit: null,
  invalid: {},
  setProgramFilter: (id) => set({ programFilter: id }),
  clearProgramFilter: () => set({ programFilter: null }),
  startEdit: (sessionId, rows) =>
    set({
      edit: {
        sessionId,
        original: rows.map((r) => ({ ...r })),
        draft: rows.map((r) => ({ ...r })),
      },
      invalid: {},
    }),
  toggleCompleted: (id) =>
    set((s) =>
      s.edit
        ? {
            edit: {
              ...s.edit,
              draft: mapRow(s.edit.draft, id, (r) => ({ ...r, completed: !r.completed })),
            },
          }
        : s,
    ),
  setWeight: (id, weight, invalid = false) =>
    set((s) =>
      s.edit
        ? {
            edit: {
              ...s.edit,
              draft: invalid ? s.edit.draft : mapRow(s.edit.draft, id, (r) => ({ ...r, weight })),
            },
            invalid: { ...s.invalid, [id]: invalid },
          }
        : s,
    ),
  cancelEdit: () => set({ edit: null, invalid: {} }),
}));
