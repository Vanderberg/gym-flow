import { useCallback } from 'react';
import * as machine from '@/domain/restTimer/restTimerMachine';
import { DEFAULT_REST_SECONDS } from '@/domain/restTimer/types';
import { useRestTimerStore } from '@/store/restTimerStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Leitura do estado e ações do cronômetro (BL-092); nunca toca a sessão. */
export function useRestTimer(deps: { clock?: () => number } = {}) {
  const clock = deps.clock ?? Date.now;
  const state = useRestTimerStore((s) => s.state);
  const now = useRestTimerStore((s) => s.now);
  const enabled = useSettingsStore((s) => s.settings?.restTimerEnabled ?? false);
  const durationSeconds = useSettingsStore(
    (s) => s.settings?.restTimerSeconds ?? DEFAULT_REST_SECONDS,
  );

  const start = useCallback(() => {
    const t = clock();
    const secs = useSettingsStore.getState().settings?.restTimerSeconds ?? DEFAULT_REST_SECONDS;
    useRestTimerStore.getState().set(machine.start(secs, t), t);
  }, [clock]);
  const pause = useCallback(() => {
    const t = clock();
    const st = useRestTimerStore.getState();
    st.set(machine.pause(st.state, t), t);
  }, [clock]);
  const resume = useCallback(() => {
    const t = clock();
    const st = useRestTimerStore.getState();
    st.set(machine.resume(st.state, t), t);
  }, [clock]);
  const stop = useCallback(() => {
    const st = useRestTimerStore.getState();
    st.set(machine.stop(st.state));
  }, []);
  const dismiss = useCallback(() => {
    const st = useRestTimerStore.getState();
    st.set(machine.dismiss(st.state));
  }, []);
  const reset = useCallback(() => useRestTimerStore.getState().set({ status: 'IDLE' }), []);
  const onExerciseMarked = useCallback(
    (completed: boolean) => {
      if (completed && useSettingsStore.getState().settings?.restTimerEnabled) start();
    },
    [start],
  );

  // `now` só muda com o ticker; sem ele (montagem/pausa) usa o relógio.
  const reference = state.status === 'RUNNING' && now > 0 ? now : clock();
  return {
    state,
    remainingMs: machine.remainingMs(state, reference),
    enabled,
    durationSeconds,
    start,
    pause,
    resume,
    stop,
    dismiss,
    reset,
    onExerciseMarked,
  };
}
