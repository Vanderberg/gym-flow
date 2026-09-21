import { act, fireEvent, render, screen } from '@testing-library/react-native';
import WorkoutScreen from '@/app/workout/index';
import type { WorkoutScreenItem, WorkoutScreenView } from '@/domain/workout/types';
import { useHelpStore } from '@/store/helpStore';

const mockHook = jest.fn();
const mockDb = {};
jest.mock('@/hooks/useWorkoutSession', () => ({ useWorkoutSession: () => mockHook() }));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));
jest.mock('@/data/database/DatabaseProvider', () => ({ useDatabase: () => mockDb }));
jest.mock('@/application/GetExerciseInfo', () => ({
  GetExerciseInfo: class {
    execute = jest.fn().mockResolvedValue({
      exerciseId: 1,
      name: 'Supino reto',
      primaryMuscle: 'Peitoral maior',
      secondaryMuscles: ['Tríceps', 'Deltoide anterior'],
      description: 'Empurra a barra.',
    });
  },
}));
jest.mock('@/data/repositories', () => ({ createRepositories: () => ({ exercises: {} }) }));
jest.setTimeout(30000);

const item = (id: number, over: Partial<WorkoutScreenItem> = {}): WorkoutScreenItem => ({
  exerciseId: id,
  name: `Exercício ${id}`,
  displayOrder: id,
  prescription: '3x10',
  technique: null,
  notes: null,
  completed: false,
  weight: null,
  lastWeight: null,
  ...over,
});
const view = (items: WorkoutScreenItem[]): WorkoutScreenView => ({
  sessionId: 7,
  program: { id: 1, name: 'Treino Padrão' },
  workout: { id: 1, code: '1', name: 'Peito', position: 1, warmupNote: null },
  items,
  progress: { done: 0, total: items.length },
});
function state(v: WorkoutScreenView) {
  return {
    view: v,
    status: 'ready',
    expanded: {},
    drafts: { 1: '62' },
    cardErrors: {},
    load: jest.fn().mockResolvedValue(undefined),
    toggleExpanded: jest.fn(),
    setDraft: jest.fn(),
    saveWeight: jest.fn().mockResolvedValue(undefined),
    adjustWeight: jest.fn(),
    applyLastWeight: jest.fn(),
    setCompleted: jest.fn(),
    finish: jest.fn(),
  };
}

beforeEach(() => act(() => useHelpStore.getState().close()));

describe('ajuda contextual', () => {
  it('legenda: não aparece sozinha, abre pelo ? e fecha sem alterar a sessão', async () => {
    const s = state(view([item(1), item(2)]));
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    expect(screen.queryByText('LEGENDA DAS TÉCNICAS')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Legenda das técnicas' }));
    expect(screen.getByText('LEGENDA DAS TÉCNICAS')).toBeTruthy();
    expect(screen.getByText('BI-SET')).toBeTruthy();
    expect(screen.getByText('PROGRESSÃO DE CARGA')).toBeTruthy();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Fechar' }).slice(-1)[0]!);
    expect(useHelpStore.getState().sheet.kind).toBe('NONE');
    expect(s.saveWeight).not.toHaveBeenCalled();
    expect(s.setCompleted).not.toHaveBeenCalled();
    expect(s.setDraft).not.toHaveBeenCalled();
    expect(s.finish).not.toHaveBeenCalled();
  });

  it('ⓘ abre detalhes do exercício', async () => {
    const s = state(view([item(1), item(2)]));
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    const infos = screen.getAllByRole('button', { name: 'Informações do exercício' });
    expect(infos).toHaveLength(2);
    expect(screen.queryByText('MÚSCULO PRINCIPAL')).toBeNull();
    await fireEvent.press(infos[0]!);
    expect(await screen.findByText('MÚSCULO PRINCIPAL')).toBeTruthy();
    expect(screen.getByText('Peitoral maior')).toBeTruthy();
    expect(screen.getByText('Tríceps · Deltoide anterior')).toBeTruthy();
    expect(screen.getByText('Empurra a barra.')).toBeTruthy();
    expect(s.saveWeight).not.toHaveBeenCalled();
    expect(s.setCompleted).not.toHaveBeenCalled();
  });

  it('? do chip só com técnica da legenda e abre no termo', async () => {
    const s = state(
      view([
        item(1, { technique: 'DROP-SET' }),
        item(2, { technique: 'TÉCNICA X' }),
        item(3, { notes: 'drop-set no fim' }),
      ]),
    );
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    expect(screen.getAllByRole('button', { name: /Explicação de/ })).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Explicação de DROP-SET' }));
    expect(useHelpStore.getState().sheet).toEqual({ kind: 'LEGEND', term: 'DROP-SET' });
    expect(screen.getByText('▶ DROP-SET')).toBeTruthy();
    expect(s.saveWeight).not.toHaveBeenCalled();
  });

  it('pressionar e soltar fora cancela a abertura', async () => {
    mockHook.mockReturnValue(state(view([item(1)])));
    await render(<WorkoutScreen />);
    const btn = screen.getByRole('button', { name: 'Legenda das técnicas' });
    await fireEvent(btn, 'pressIn');
    expect(useHelpStore.getState().opening).toBe(true);
    await fireEvent(btn, 'pressOut');
    expect(useHelpStore.getState().opening).toBe(false);
  });
});
