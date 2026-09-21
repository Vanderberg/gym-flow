import { act, render } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { RestTimerProvider } from '@/components/RestTimerProvider';
import { start } from '@/domain/restTimer/restTimerMachine';
import { useRestTimerStore } from '@/store/restTimerStore';
import { useSettingsStore } from '@/store/settingsStore';

jest.mock('@/hooks/useSettings', () => ({ useSettings: () => ({}) }));

let now = 1_000_000;
const vibrate = jest.fn();

const settings = (enabled: boolean) => ({
  settings: {
    activeProgramId: 1,
    sequenceType: 'CONTINUOUS' as const,
    restTimerEnabled: enabled,
    restTimerSeconds: 90,
  },
});

beforeEach(() => {
  jest.useFakeTimers();
  now = 1_000_000;
  vibrate.mockClear();
  useRestTimerStore.setState({ state: { status: 'IDLE' }, now: 0 });
  useSettingsStore.setState(settings(true));
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

const mount = () =>
  render(
    <RestTimerProvider clock={() => now} vibrate={vibrate}>
      {null}
    </RestTimerProvider>,
  );

describe('RestTimerProvider', () => {
  it('vibra uma vez ao terminar com o app ativo', async () => {
    await mount();
    await act(async () => useRestTimerStore.getState().set(start(10, now), now));
    now += 10000;
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(useRestTimerStore.getState().state.status).toBe('FINISHED');
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith(400);
  });
  it('terminado em segundo plano: mostra FINISHED sem vibrar', async () => {
    let handler: ((s: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, h: never) => {
      handler = h;
      return { remove: jest.fn() };
    }) as never);
    await mount();
    await act(async () => useRestTimerStore.getState().set(start(10, now), now));
    now += 60000;
    await act(async () => handler?.('active'));
    expect(useRestTimerStore.getState().state.status).toBe('FINISHED');
    expect(vibrate).not.toHaveBeenCalled();
  });
  it('desativar a configuração encerra a contagem', async () => {
    await mount();
    await act(async () => useRestTimerStore.getState().set(start(10, now), now));
    await act(async () => useSettingsStore.setState(settings(false)));
    expect(useRestTimerStore.getState().state.status).toBe('IDLE');
  });
  it('limpa o ticker ao desmontar', async () => {
    const clear = jest.spyOn(global, 'clearInterval');
    const view = await mount();
    await act(async () => useRestTimerStore.getState().set(start(10, now), now));
    clear.mockClear();
    await view.unmount();
    expect(clear).toHaveBeenCalled();
  });
});
