import { useEffect, type ReactNode } from 'react';
import { AppState, Vibration } from 'react-native';
import { evaluate } from '@/domain/restTimer/restTimerMachine';
import { useSettings } from '@/hooks/useSettings';
import { useRestTimerStore } from '@/store/restTimerStore';
import { useSettingsStore } from '@/store/settingsStore';

const TICK_MS = 250;
const VIBRATION_MS = 400;

interface Props {
  children: ReactNode;
  clock?: () => number;
  vibrate?: (ms: number) => void;
}

/** Ticker no nível do app (BL-092): só corre durante RUNNING; vibra uma vez ao terminar com o app ativo. */
export function RestTimerProvider({
  children,
  clock = Date.now,
  vibrate = (ms) => Vibration.vibrate(ms),
}: Props) {
  useSettings(); // garante as configurações carregadas na inicialização
  const enabled = useSettingsStore((s) => s.settings?.restTimerEnabled ?? false);
  const status = useRestTimerStore((s) => s.state.status);

  useEffect(() => {
    if (!enabled && useRestTimerStore.getState().state.status !== 'IDLE') {
      useRestTimerStore.getState().set({ status: 'IDLE' });
    }
  }, [enabled]);

  useEffect(() => {
    const tick = () => {
      const store = useRestTimerStore.getState();
      const t = clock();
      const r = evaluate(store.state, t);
      store.set(r.state, t);
      if (r.justFinished) vibrate(VIBRATION_MS);
    };
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') tick();
    });
    let id: ReturnType<typeof setInterval> | undefined;
    if (status === 'RUNNING') id = setInterval(tick, TICK_MS);
    return () => {
      sub.remove();
      if (id !== undefined) clearInterval(id);
    };
  }, [status, clock, vibrate]);

  return <>{children}</>;
}
