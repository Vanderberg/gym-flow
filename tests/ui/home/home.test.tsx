import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '@/app/(tabs)/index';
import { SequenceRail } from '@/components/common/SequenceRail';
import { WeekStrip } from '@/components/common/WeekStrip';
import type { HomeView } from '@/domain/home/types';

const mockHook = jest.fn();
jest.mock('@/hooks/useHome', () => ({ useHome: () => mockHook() }));
jest.setTimeout(30000);

const w3 = { id: 30, code: '3', name: 'Perna Completo', exerciseCount: 6 };

const base: HomeView = {
  program: { id: 1, name: 'Treino Padrão' },
  sequenceType: 'CONTINUOUS',
  indicator: {
    kind: 'RAIL',
    steps: [
      { code: '1', state: 'DONE' },
      { code: '2', state: 'DONE' },
      { code: '3', state: 'CURRENT' },
    ],
  },
  card: { kind: 'WORKOUT', workout: w3, dayLabel: null, doneToday: false },
  suggestion: null,
  localDate: '2026-09-20',
  browsableWorkouts: [],
};

function state(view: Partial<HomeView> = {}, over: Record<string, unknown> = {}) {
  return {
    view: { ...base, ...view },
    status: 'ready',
    notice: null,
    pendingDialogShown: false,
    reload: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    continueWorkout: jest.fn(),
    discard: jest.fn().mockResolvedValue(undefined),
    switchToContinuous: jest.fn().mockResolvedValue(undefined),
    markDialogShown: jest.fn(),
    ...over,
  };
}

describe('Home - US1', () => {
  it('contínua: badge, sequência, rail, cartão e início com 1 toque', async () => {
    const s = state();
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    expect(screen.getByText('Treino Padrão')).toBeTruthy();
    expect(screen.getByText('Sequência contínua')).toBeTruthy();
    expect(screen.getByLabelText('Treino 3, atual')).toBeTruthy();
    expect(screen.getByText('PRÓXIMO TREINO · DIA 3')).toBeTruthy();
    expect(screen.getByText('Perna Completo')).toBeTruthy();
    expect(screen.getByText('6 exercícios')).toBeTruthy();
    expect(s.start).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'COMEÇAR TREINO' }));
    expect(s.start).toHaveBeenCalledWith(30);
  });

  it('semanal: strip, rótulo do dia e Concluído hoje com botão ativo', async () => {
    const days = [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
      weekday,
      label: weekday === 7 ? 'C' : '—',
      isToday: weekday === 7,
      hasSession: weekday === 7,
    }));
    mockHook.mockReturnValue(
      state({
        sequenceType: 'WEEKLY',
        indicator: { kind: 'WEEK', days },
        card: {
          kind: 'WORKOUT',
          workout: { ...w3, code: 'C' },
          dayLabel: 'DOMINGO',
          doneToday: true,
        },
      }),
    );
    await render(<HomeScreen />);
    expect(screen.getByText('Dias da semana')).toBeTruthy();
    expect(screen.getByText('DOMINGO · TREINO C')).toBeTruthy();
    expect(screen.getByText('✓ Concluído hoje')).toBeTruthy();
    expect(screen.getByLabelText('DOMINGO, C, hoje, treino feito')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'COMEÇAR TREINO' })).toBeTruthy();
  });

  it('nome longo em até 2 linhas', async () => {
    mockHook.mockReturnValue(
      state({
        card: {
          kind: 'WORKOUT',
          workout: { ...w3, name: 'Um nome de treino extremamente longo '.repeat(5) },
          dayLabel: null,
          doneToday: false,
        },
      }),
    );
    await render(<HomeScreen />);
    expect(screen.getByText(/Um nome de treino/).props.numberOfLines).toBe(2);
  });

  it('carregando mostra esqueleto; erro mostra Tentar de novo', async () => {
    mockHook.mockReturnValue(state({}, { view: null, status: 'loading' }));
    const r = await render(<HomeScreen />);
    expect(screen.getByLabelText('Carregando')).toBeTruthy();
    const s = state({}, { view: null, status: 'error' });
    mockHook.mockReturnValue(s);
    await r.rerender(<HomeScreen />);
    expect(screen.getByText('Não foi possível carregar seus treinos')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(s.reload).toHaveBeenCalled();
  });

  it('exibe aviso de conflito ao iniciar', async () => {
    mockHook.mockReturnValue(state({}, { notice: 'Já existe um treino em andamento' }));
    await render(<HomeScreen />);
    expect(screen.getByText('Já existe um treino em andamento')).toBeTruthy();
  });
});

describe('componentes comuns', () => {
  it('SequenceRail e WeekStrip descrevem o estado', async () => {
    await render(<SequenceRail steps={[{ code: 'A', state: 'PENDING' }]} />);
    expect(screen.getByLabelText('Treino A, pendente')).toBeTruthy();
    await render(
      <WeekStrip days={[{ weekday: 2, label: 'opc.', isToday: false, hasSession: false }]} />,
    );
    expect(screen.getByLabelText('TERÇA-FEIRA, opc.')).toBeTruthy();
  });
});

describe('Home - US2', () => {
  const browsable = [w3, { id: 10, code: '1', name: 'Peito', exerciseCount: 5 }];
  it('descanso: sem botão primário; Ver treinos abre o sheet e inicia', async () => {
    const s = state({
      card: { kind: 'REST', dayLabel: 'QUARTA-FEIRA', canBrowseWorkouts: true },
      browsableWorkouts: browsable,
    });
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    expect(screen.getByText('QUARTA-FEIRA · DESCANSO')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'COMEÇAR TREINO' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver treinos do programa' }));
    await fireEvent.press(await screen.findByRole('button', { name: /^1 Peito/ }));
    expect(s.start).toHaveBeenCalledWith(10);
  });

  it('opcional mostra a nota como está', async () => {
    mockHook.mockReturnValue(
      state({
        card: {
          kind: 'OPTIONAL_DAY',
          dayLabel: 'SÁBADO',
          note: 'Abdominais supra e infra',
          canBrowseWorkouts: true,
        },
        browsableWorkouts: browsable,
      }),
    );
    await render(<HomeScreen />);
    expect(screen.getByText('SÁBADO · OPCIONAL')).toBeTruthy();
    expect(screen.getByText('Abdominais supra e infra')).toBeTruthy();
  });

  it('sem agenda: atalho para contínua e nada de iniciar', async () => {
    const s = state({
      sequenceType: 'WEEKLY',
      indicator: { kind: 'NONE' },
      card: { kind: 'NO_SCHEDULE' },
    });
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    expect(screen.getByText('Sem agenda configurada para este programa')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'COMEÇAR TREINO' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para sequência contínua' }));
    expect(s.switchToContinuous).toHaveBeenCalled();
  });

  it('sugestão só texto; ausente quando nula; NO_WORKOUTS sem ação', async () => {
    mockHook.mockReturnValue(
      state({ suggestion: '30 min de cardio', card: { kind: 'NO_WORKOUTS' } }),
    );
    const r = await render(<HomeScreen />);
    expect(screen.getByText('SUGESTÃO DA FICHA')).toBeTruthy();
    expect(screen.getByText('30 min de cardio')).toBeTruthy();
    expect(screen.getByText('Este programa não tem treinos ativos')).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    mockHook.mockReturnValue(state({ suggestion: null }));
    await r.rerender(<HomeScreen />);
    expect(screen.queryByText('SUGESTÃO DA FICHA')).toBeNull();
  });
});

describe('Home - US3', () => {
  const inProgress = {
    card: { kind: 'IN_PROGRESS' as const, sessionId: 5, workoutName: 'Costas', done: 4, total: 9 },
  };

  it('cartão em andamento sem botão de iniciar outro treino', async () => {
    const s = state(inProgress, { pendingDialogShown: true });
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    expect(screen.getByText('TREINO EM ANDAMENTO')).toBeTruthy();
    expect(screen.getByText('4 / 9 realizados')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'COMEÇAR TREINO' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'CONTINUAR TREINO' }));
    expect(s.continueWorkout).toHaveBeenCalled();
  });

  it('diálogo de sessão pendente: Continuar', async () => {
    const s = state(inProgress);
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    expect(await screen.findByText('Você possui um treino em andamento')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(s.continueWorkout).toHaveBeenCalled();
    expect(s.markDialogShown).toHaveBeenCalled();
  });

  it('Descartar pede segunda confirmação; cancelar não escreve; confirmar descarta', async () => {
    const s = state(inProgress);
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Descartar' }));
    expect(
      await screen.findByText(/Isso não altera sua sequência nem suas estatísticas/),
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(s.discard).not.toHaveBeenCalled();
    expect(screen.getByText('TREINO EM ANDAMENTO')).toBeTruthy();
  });

  it('confirmar o descarte chama DiscardInProgressSession', async () => {
    const s = state(inProgress);
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Descartar' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Descartar treino' }));
    await waitFor(() => expect(s.discard).toHaveBeenCalledTimes(1));
  });

  it('fechar o diálogo mantém o cartão e não escreve nada', async () => {
    const s = state(inProgress);
    mockHook.mockReturnValue(s);
    await render(<HomeScreen />);
    await fireEvent.press((await screen.findAllByRole('button', { name: 'Fechar' }))[0]);
    expect(screen.getByText('TREINO EM ANDAMENTO')).toBeTruthy();
    expect(s.discard).not.toHaveBeenCalled();
    expect(s.start).not.toHaveBeenCalled();
  });
});
