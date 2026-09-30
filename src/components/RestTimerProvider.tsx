import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { AppState, Vibration } from 'react-native';
import { evaluate } from '@/domain/restTimer/restTimerMachine';
import { useSettings } from '@/hooks/useSettings';
import { useRestTimerStore } from '@/store/restTimerStore';
import { useSettingsStore } from '@/store/settingsStore';

const TICK_MS = 250;
const VIBRATION_MS = 400;
const REST_TIMER_END_SOUND = require('../../assets/sounds/rest-timer-end.wav') as number;

interface Props {
  children: ReactNode;
  clock?: () => number;
  vibrate?: (ms: number) => void;
  playSound?: () => void;
  stopSound?: () => void;
  setAudioMode?: () => void;
}

/** Ticker no nível do app (BL-092): só corre durante RUNNING; vibra e toca um som uma vez ao terminar com o app ativo. */
export function RestTimerProvider({
  children,
  clock = Date.now,
  vibrate = (ms) => Vibration.vibrate(ms),
  playSound: playSoundProp,
  stopSound: stopSoundProp,
  setAudioMode: setAudioModeProp,
}: Props) {
  useSettings(); // garante as configurações carregadas na inicialização
  const enabled = useSettingsStore((s) => s.settings?.restTimerEnabled ?? false);
  const status = useRestTimerStore((s) => s.state.status);
  const prevStatusRef = useRef(status);

  const player = useAudioPlayer(REST_TIMER_END_SOUND);
  const defaultPlaySound = useCallback(() => {
    player.seekTo(0);
    player.play();
  }, [player]);
  const defaultStopSound = useCallback(() => player.pause(), [player]);
  const playSound = playSoundProp ?? defaultPlaySound;
  const stopSound = stopSoundProp ?? defaultStopSound;
  const setAudioMode = setAudioModeProp ?? (() => setAudioModeAsync({ playsInSilentMode: false }));

  useEffect(() => {
    setAudioMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled && useRestTimerStore.getState().state.status !== 'IDLE') {
      useRestTimerStore.getState().set({ status: 'IDLE' });
    }
  }, [enabled]);

  useEffect(() => {
    if (status === 'RUNNING' && prevStatusRef.current === 'FINISHED') {
      stopSound();
    }
    prevStatusRef.current = status;
  }, [status, stopSound]);

  useEffect(() => {
    const tick = () => {
      const store = useRestTimerStore.getState();
      const t = clock();
      const r = evaluate(store.state, t);
      store.set(r.state, t);
      if (r.justFinished) {
        vibrate(VIBRATION_MS);
        playSound();
      }
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
  }, [status, clock, vibrate, playSound]);

  return <>{children}</>;
}
