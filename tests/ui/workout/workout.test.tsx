import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import WorkoutScreen from '@/app/workout/index';
import type { WorkoutScreenItem, WorkoutScreenView } from '@/domain/workout/types';

const mockHook = jest.fn();
jest.mock('@/hooks/useWorkoutSession', () => ({ useWorkoutSession: () => mockHook() }));
jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({ setRestTimerEnabled: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));
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

function view(items: WorkoutScreenItem[], warmupNote: string | null = null): WorkoutScreenView {
  return {
    sessionId: 7,
    program: { id: 1, name: 'Treino Padrão' },
    workout: { id: 1, code: '1', name: 'Peito e Tríceps', position: 1, warmupNote },
    items,
    progress: { done: items.filter((i) => i.completed).length, total: items.length },
  };
}

function state(v: WorkoutScreenView | null, over: Record<string, unknown> = {}) {
  return {
    view: v,
    status: v ? 'ready' : 'noSession',
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
    ...over,
  };
}

const three = () => view([item(1), item(2), item(3, { completed: true })]);

describe('Tela de treino - US1', () => {
  it('cabeçalho, progresso e cartões', async () => {
    mockHook.mockReturnValue(state(three()));
    await render(<WorkoutScreen />);
    expect(screen.getByText('TREINO 1')).toBeTruthy();
    expect(screen.getByText('Peito e Tríceps')).toBeTruthy();
    expect(screen.getByText('Treino Padrão')).toBeTruthy();
    expect(screen.getByText('1 / 3 realizados')).toBeTruthy();
    expect(screen.getByText('Exercício 2')).toBeTruthy();
    expect(screen.queryByText(/descartar/i)).toBeNull();
  });

  it('marca um exercício do meio sem exigir ordem', async () => {
    const s = state(three());
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    const feito = screen.getAllByRole('button', { name: '✓ FEITO' });
    await fireEvent.press(feito[1]);
    expect(s.setCompleted).toHaveBeenCalledWith(2, true);
  });

  it('cartão feito reabre e desmarca', async () => {
    const s = state(three(), { expanded: { 3: true } });
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'DESMARCAR' }));
    expect(s.setCompleted).toHaveBeenCalledWith(3, false);
    await fireEvent.press(screen.getByRole('button', { name: 'Exercício 3, feito' }));
    expect(s.toggleExpanded).toHaveBeenCalledWith(3, true);
  });

  it('finalizar sempre habilitado e confirma antes de gravar', async () => {
    const s = state(view([item(1), item(2)]));
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'FINALIZAR TREINO' }));
    expect(
      screen.getByText(
        '0 de 2 exercícios realizados. (2 pendentes serão registrados como não realizados)',
      ),
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(s.finish).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'FINALIZAR TREINO' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Finalizar' }));
    await waitFor(() => expect(s.finish).toHaveBeenCalledTimes(1));
  });

  it('falha ao finalizar mostra aviso', async () => {
    mockHook.mockReturnValue(state(three(), { finish: jest.fn().mockResolvedValue(false) }));
    await render(<WorkoutScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'FINALIZAR TREINO' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Finalizar' }));
    expect(await screen.findByText('Não foi possível finalizar. Nada foi alterado.')).toBeTruthy();
  });
});

describe('Tela de treino - US2', () => {
  it('última carga, Usar X kg e sem carga anterior', async () => {
    const s = state(view([item(1, { lastWeight: 60 }), item(2)]));
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    expect(screen.getByText('ÚLTIMA CARGA 60 kg')).toBeTruthy();
    expect(screen.getByText('Sem carga anterior')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Usar/ })).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Usar 60 kg' }));
    expect(s.applyLastWeight).toHaveBeenCalledWith(1);
  });

  it('digitar, perder foco e ajustar peso', async () => {
    const s = state(view([item(1)]));
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    const input = screen.getByLabelText('Peso de Exercício 1');
    await fireEvent.changeText(input, '62,5');
    expect(s.setDraft).toHaveBeenCalledWith(1, '62,5');
    await fireEvent(input, 'blur');
    expect(s.saveWeight).toHaveBeenCalledWith(1);
    await fireEvent.press(screen.getByLabelText('Aumentar 2,5 quilos'));
    expect(s.adjustWeight).toHaveBeenCalledWith(1, 2.5);
    await fireEvent.press(screen.getByLabelText('Diminuir 2,5 quilos'));
    expect(s.adjustWeight).toHaveBeenCalledWith(1, -2.5);
  });

  it('erro mostra aviso com Tentar de novo e mantém o valor', async () => {
    const s = state(view([item(1)]), {
      drafts: { 1: '60' },
      cardErrors: { 1: 'Não foi possível salvar.' },
    });
    mockHook.mockReturnValue(s);
    await render(<WorkoutScreen />);
    expect(screen.getByDisplayValue('60')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(s.saveWeight).toHaveBeenCalledWith(1);
  });

  it('bi-set: dois cartões independentes com chip e observação; sem repetições', async () => {
    const bi = { technique: 'BI-SET' };
    mockHook.mockReturnValue(
      state(
        view([
          item(1, { ...bi, notes: 'com Exercício 2' }),
          item(2, { ...bi, notes: 'com Exercício 1' }),
        ]),
      ),
    );
    await render(<WorkoutScreen />);
    expect(screen.getAllByText('BI-SET')).toHaveLength(2);
    expect(screen.getByText('com Exercício 2')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: '✓ FEITO' })).toHaveLength(2);
    expect(screen.queryByText(/repeti/i)).toBeNull();
  });

  it('cartão feito colapsado mostra prescrição e carga', async () => {
    mockHook.mockReturnValue(state(view([item(1, { completed: true, weight: 62.5 })])));
    await render(<WorkoutScreen />);
    expect(screen.getByText('3x10 · 62,5 kg')).toBeTruthy();
  });
});

describe('Tela de treino - US3', () => {
  it('aquecimento como texto fora do progresso', async () => {
    mockHook.mockReturnValue(state(view([item(1)], 'Aquecimento de manguito rotador')));
    await render(<WorkoutScreen />);
    expect(screen.getByText('Aquecimento de manguito rotador')).toBeTruthy();
    expect(screen.getByText('0 / 1 realizados')).toBeTruthy();
  });

  it('sem nota não mostra o bloco', async () => {
    mockHook.mockReturnValue(state(view([item(1)])));
    await render(<WorkoutScreen />);
    expect(screen.queryByText(/Aquecimento/)).toBeNull();
  });

  it('treino sem exercícios: estado vazio e finalizar habilitado', async () => {
    mockHook.mockReturnValue(state(view([])));
    await render(<WorkoutScreen />);
    expect(screen.getByText('Este treino não tem exercícios')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'FINALIZAR TREINO' })).toBeTruthy();
  });

  it('sem sessão em andamento volta à Home', async () => {
    mockHook.mockReturnValue(state(null));
    await render(<WorkoutScreen />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  });

  it('slots de ajuda não aparecem sem handler', async () => {
    mockHook.mockReturnValue(state(view([item(1)])));
    await render(<WorkoutScreen />);
    expect(screen.queryByLabelText('Informações')).toBeNull();
    expect(screen.queryByLabelText('Ajuda')).toBeNull();
  });
});
