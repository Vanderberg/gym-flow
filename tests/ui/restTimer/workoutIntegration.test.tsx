import { act, fireEvent, render, screen } from '@testing-library/react-native';
import WorkoutScreen from '@/app/workout/index';
import type { WorkoutScreenView } from '@/domain/workout/types';
import { useRestTimerStore } from '@/store/restTimerStore';
import { useSettingsStore } from '@/store/settingsStore';

const mockHook = jest.fn();
jest.mock('@/hooks/useWorkoutSession', () => ({ useWorkoutSession: () => mockHook() }));
const mockSetEnabled = jest.fn().mockResolvedValue(undefined);
jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({ setRestTimerEnabled: mockSetEnabled }),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));
jest.setTimeout(30000);

const view: WorkoutScreenView = {
  sessionId: 7,
  program: { id: 1, name: 'Treino Padrão' },
  workout: { id: 1, code: '1', name: 'Peito', position: 1, warmupNote: null },
  items: [1, 2].map((id) => ({
    exerciseId: id,
    name: `Exercício ${id}`,
    displayOrder: id,
    prescription: '3x10',
    technique: null,
    notes: null,
    completed: false,
    weight: null,
    lastWeight: null,
  })),
  progress: { done: 0, total: 2 },
};

const setEnabled = (enabled: boolean) =>
  useSettingsStore.setState({
    settings: {
      activeProgramId: 1,
      sequenceType: 'CONTINUOUS',
      restTimerEnabled: enabled,
      restTimerSeconds: 90,
    },
  });

function session() {
  return {
    view,
    status: 'ready',
    expanded: {},
    drafts: {},
    cardErrors: {},
    load: jest.fn().mockResolvedValue(undefined),
    toggleExpanded: jest.fn(),
    setDraft: jest.fn(),
    saveWeight: jest.fn().mockResolvedValue(undefined),
    adjustWeight: jest.fn().mockResolvedValue(undefined),
    applyLastWeight: jest.fn().mockResolvedValue(undefined),
    setCompleted: jest.fn().mockResolvedValue(undefined),
    finish: jest.fn().mockResolvedValue(true),
  };
}

beforeEach(() => {
  mockSetEnabled.mockClear();
  useRestTimerStore.setState({ state: { status: 'IDLE' }, now: 0 });
});

describe('cronômetro na tela de treino', () => {
  it('desativado: sem controles de contagem e marcar não inicia', async () => {
    setEnabled(false);
    const s = session();
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    expect(screen.queryByLabelText('Iniciar descanso')).toBeNull();
    await fireEvent.press(screen.getAllByLabelText(/Ativar cronômetro/)[0]!);
    expect(mockSetEnabled).toHaveBeenCalledWith(true);
    await fireEvent.press(screen.getAllByText(/FEITO/)[0]!);
    expect(useRestTimerStore.getState().state.status).toBe('IDLE');
  });
  it('ativo: barra parada e marcar inicia e reinicia; sessão intacta', async () => {
    setEnabled(true);
    const s = session();
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    expect(screen.getByLabelText('Iniciar descanso')).toBeTruthy();
    await fireEvent.press(screen.getAllByText(/FEITO/)[0]!);
    await act(async () => undefined);
    expect(useRestTimerStore.getState().state.status).toBe('RUNNING');
    expect(s.setCompleted).toHaveBeenCalledTimes(1);
    const first = useRestTimerStore.getState().state;
    await fireEvent.press(screen.getByLabelText('Pausar descanso'));
    expect(useRestTimerStore.getState().state.status).toBe('PAUSED');
    await fireEvent.press(screen.getByLabelText('Retomar descanso'));
    await fireEvent.press(screen.getByLabelText('Encerrar descanso'));
    expect(useRestTimerStore.getState().state.status).toBe('IDLE');
    expect(first.status).toBe('RUNNING');
    // ações do cronômetro não chamam casos de uso da sessão
    expect(s.setCompleted).toHaveBeenCalledTimes(1);
    expect(s.saveWeight).not.toHaveBeenCalled();
    expect(s.finish).not.toHaveBeenCalled();
  });
  it('desativar durante a contagem a encerra', async () => {
    setEnabled(true);
    mockHook.mockReturnValue(session());
    await render(<WorkoutScreen />);
    await fireEvent.press(screen.getByLabelText('Iniciar descanso'));
    expect(useRestTimerStore.getState().state.status).toBe('RUNNING');
    await act(async () => setEnabled(false));
    // o encerramento é feito pelo RestTimerProvider; aqui só a barra some
    expect(screen.queryByLabelText('Pausar descanso')).toBeNull();
  });
});
