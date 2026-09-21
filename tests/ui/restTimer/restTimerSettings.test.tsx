import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import SettingsScreen from '@/app/(tabs)/settings';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
const mockHook = jest.fn();
jest.mock('@/hooks/useSettings', () => ({ useSettings: () => mockHook() }));

function state(enabled: boolean, seconds = 90) {
  return {
    settings: {
      activeProgramId: 1,
      sequenceType: 'CONTINUOUS',
      restTimerEnabled: enabled,
      restTimerSeconds: seconds,
    },
    programs: [{ id: 1, name: 'Treino Padrão' }],
    resetSequence: jest.fn(),
    setRestTimerEnabled: jest.fn().mockResolvedValue(undefined),
    setRestTimerDuration: jest.fn().mockResolvedValue(undefined),
  };
}

describe('Configurações: descanso', () => {
  it('mostra a seção, o switch e o tempo', async () => {
    mockHook.mockReturnValue(state(true));
    await render(<SettingsScreen />);
    expect(screen.getByText('DESCANSO')).toBeTruthy();
    expect(screen.getByLabelText('Cronômetro de descanso')).toBeTruthy();
    expect(screen.getByLabelText('Tempo de descanso, 01:30')).toBeTruthy();
  });
  it('tempo desabilitado com o cronômetro desativado; switch chama o caso de uso', async () => {
    const s = state(false);
    mockHook.mockReturnValue(s);
    await render(<SettingsScreen />);
    expect(
      screen.getByLabelText('Tempo de descanso, 01:30').props.accessibilityState,
    ).toMatchObject({ disabled: true });
    await fireEvent.press(screen.getByLabelText('Cronômetro de descanso'));
    expect(s.setRestTimerEnabled).toHaveBeenCalledWith(true);
  });
  it('salva um tempo válido pelo sheet', async () => {
    const s = state(true);
    mockHook.mockReturnValue(s);
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Tempo de descanso, 01:30'));
    const input = screen.getByLabelText('Tempo de descanso (mm:ss)');
    expect(input.props.value).toBe('01:30');
    await fireEvent.changeText(input, '02:00');
    await fireEvent.press(screen.getByLabelText('Salvar'));
    await waitFor(() => expect(s.setRestTimerDuration).toHaveBeenCalledWith(120));
  });
  it.each(['00:04', '60:01', ''])('rejeita "%s" com mensagem e sem salvar', async (text) => {
    const s = state(true);
    mockHook.mockReturnValue(s);
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Tempo de descanso, 01:30'));
    await fireEvent.changeText(screen.getByLabelText('Tempo de descanso (mm:ss)'), text);
    await fireEvent.press(screen.getByLabelText('Salvar'));
    expect(screen.getByText('Informe um tempo entre 00:05 e 60:00')).toBeTruthy();
    expect(s.setRestTimerDuration).not.toHaveBeenCalled();
  });
  it('abrir e cancelar não altera nada', async () => {
    const s = state(true);
    mockHook.mockReturnValue(s);
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Tempo de descanso, 01:30'));
    await fireEvent.press(screen.getByLabelText('Cancelar'));
    expect(s.setRestTimerDuration).not.toHaveBeenCalled();
    expect(s.setRestTimerEnabled).not.toHaveBeenCalled();
  });
});
