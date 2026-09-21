import { useCallback } from 'react';
import { useHelpStore } from '@/store/helpStore';

/** Abre/fecha as folhas de ajuda; só muda o helpStore (BL-116). */
export function useHelp() {
  const sheet = useHelpStore((s) => s.sheet);
  const restoreFocusExerciseId = useHelpStore((s) => s.restoreFocusExerciseId);
  const openLegend = useCallback((term?: string) => useHelpStore.getState().openLegend(term), []);
  const openExercise = useCallback(
    (exerciseId: number) => useHelpStore.getState().openExercise(exerciseId),
    [],
  );
  const close = useCallback(() => useHelpStore.getState().close(), []);
  const onTriggerPressIn = useCallback(
    (exerciseId: number | null) => useHelpStore.getState().markOpening(exerciseId),
    [],
  );
  const onTriggerPressOut = useCallback(() => useHelpStore.getState().cancelOpening(), []);
  const consumeRestoreFocus = useCallback(() => useHelpStore.getState().consumeRestoreFocus(), []);
  return {
    sheet,
    restoreFocusExerciseId,
    openLegend,
    openExercise,
    close,
    onTriggerPressIn,
    onTriggerPressOut,
    consumeRestoreFocus,
  };
}
