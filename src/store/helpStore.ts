import { create } from 'zustand';
import type { HelpSheetState } from '../domain/help/types';

/** Estado só de UI da ajuda; não conhece sessão, cronômetro nem repositórios. */
export interface HelpState {
  sheet: HelpSheetState;
  opening: boolean;
  restoreFocusExerciseId: number | null;
  pendingFocusExerciseId: number | null;
  openLegend(term?: string): void;
  openExercise(exerciseId: number): void;
  close(): void;
  markOpening(exerciseId: number | null): void;
  cancelOpening(): void;
  consumeRestoreFocus(): void;
}

export const useHelpStore = create<HelpState>((set, get) => ({
  sheet: { kind: 'NONE' },
  opening: false,
  restoreFocusExerciseId: null,
  pendingFocusExerciseId: null,
  openLegend: (term) =>
    set((s) => ({
      sheet: term === undefined ? { kind: 'LEGEND' } : { kind: 'LEGEND', term },
      opening: true,
      restoreFocusExerciseId: s.pendingFocusExerciseId,
    })),
  openExercise: (exerciseId) =>
    set((s) => ({
      sheet: { kind: 'EXERCISE', exerciseId },
      opening: true,
      restoreFocusExerciseId: s.pendingFocusExerciseId,
    })),
  close: () => set({ sheet: { kind: 'NONE' }, opening: false }),
  markOpening: (exerciseId) => set({ opening: true, pendingFocusExerciseId: exerciseId }),
  cancelOpening: () => {
    if (get().sheet.kind === 'NONE') set({ opening: false });
  },
  consumeRestoreFocus: () => set({ restoreFocusExerciseId: null, pendingFocusExerciseId: null }),
}));
