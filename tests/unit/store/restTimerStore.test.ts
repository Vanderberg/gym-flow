import { act, renderHook } from '@testing-library/react-native';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useRestTimerStore } from '@/store/restTimerStore';
import { useSettingsStore } from '@/store/settingsStore';

function withSettings(enabled: boolean, seconds = 90) {
  useSettingsStore.setState({
    settings: {
      activeProgramId: 1,
      sequenceType: 'CONTINUOUS',
      restTimerEnabled: enabled,
      restTimerSeconds: seconds,
    },
  });
}

let now = 1_000_000;
const clock = () => now;

beforeEach(() => {
  now = 1_000_000;
  useRestTimerStore.setState({ state: { status: 'IDLE' }, now: 0 });
  withSettings(true);
});

describe('restTimerStore e useRestTimer', () => {
  it('começa IDLE', async () => {
    expect(useRestTimerStore.getState().state.status).toBe('IDLE');
  });
  it('onExerciseMarked(true) com o cronômetro ativo inicia e reinicia', async () => {
    const { result } = await renderHook(() => useRestTimer({ clock }));
    await act(async () => result.current.onExerciseMarked(true));
    expect(result.current.state.status).toBe('RUNNING');
    now += 30000;
    await act(async () => result.current.onExerciseMarked(true));
    expect(useRestTimerStore.getState().state).toMatchObject({ endsAt: now + 90000 });
  });
  it('desmarcar ou cronômetro desativado não fazem nada', async () => {
    const { result } = await renderHook(() => useRestTimer({ clock }));
    await act(async () => result.current.onExerciseMarked(false));
    expect(result.current.state.status).toBe('IDLE');
    await act(async () => withSettings(false));
    await act(async () => result.current.onExerciseMarked(true));
    expect(result.current.state.status).toBe('IDLE');
  });
  it('pausar, retomar, encerrar e reset', async () => {
    const { result } = await renderHook(() => useRestTimer({ clock }));
    await act(async () => result.current.start());
    now += 10000;
    await act(async () => result.current.pause());
    expect(result.current.state).toMatchObject({ status: 'PAUSED', remainingMs: 80000 });
    await act(async () => result.current.resume());
    expect(result.current.state.status).toBe('RUNNING');
    await act(async () => result.current.stop());
    expect(result.current.state.status).toBe('IDLE');
    await act(async () => result.current.start());
    await act(async () => result.current.reset());
    expect(result.current.state.status).toBe('IDLE');
  });
  it('alterar a duração configurada não afeta a contagem em curso', async () => {
    const { result } = await renderHook(() => useRestTimer({ clock }));
    await act(async () => result.current.start());
    await act(async () => withSettings(true, 30));
    expect(useRestTimerStore.getState().state).toMatchObject({ durationMs: 90000 });
  });
});
