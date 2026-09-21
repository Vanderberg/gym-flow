import { fireEvent, render, screen } from '@testing-library/react-native';
import StatisticsScreen from '@/app/(tabs)/statistics';
import type { StatisticsView } from '@/domain/statistics/types';

const mockHook = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@/hooks/useStatistics', () => ({ useStatistics: () => mockHook() }));
jest.mock('expo-router', () => ({ router: { navigate: (...a: unknown[]) => mockNavigate(...a) } }));
jest.setTimeout(30000);

const base: StatisticsView = {
  count: 17,
  weeksTouched: 5,
  weeklyAverage: 3.4,
  averageIntervalDays: 2,
  range: { period: 'MONTH', start: '2026-09-01', end: '2026-09-30', label: 'SETEMBRO 2026' },
  programFilter: null,
  programs: [{ id: 2, name: 'Treino Monstro' }],
  hasAnySession: true,
};

function state(view: Partial<StatisticsView> | null, over: Record<string, unknown> = {}) {
  return {
    view: view === null ? null : { ...base, ...view },
    status: 'ready',
    period: 'MONTH',
    programFilter: null,
    reload: jest.fn(),
    setPeriod: jest.fn(),
    setProgramFilter: jest.fn(),
    ...over,
  };
}

describe('Estatísticas', () => {
  it('mostra período, três números e sem navegação/calendário', async () => {
    mockHook.mockReturnValue(state({}));
    await render(<StatisticsScreen />);
    expect(screen.getByText('SETEMBRO 2026')).toBeTruthy();
    expect(screen.getByLabelText('Treinos no período: 17')).toBeTruthy();
    expect(screen.getByText('3,4')).toBeTruthy();
    expect(screen.getByText('2,0 dias')).toBeTruthy();
    expect(screen.queryByText('‹')).toBeNull();
    expect(screen.getByLabelText('Trimestre')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Mês', selected: true })).toBeTruthy();
  });

  it('troca de período chama a ação', async () => {
    const s = state({});
    mockHook.mockReturnValue(s);
    await render(<StatisticsScreen />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Ano' }));
    expect(s.setPeriod).toHaveBeenCalledWith('YEAR');
  });

  it('período sem treinos e intervalo nulo', async () => {
    mockHook.mockReturnValue(state({ count: 0, weeklyAverage: 0, averageIntervalDays: null }));
    await render(<StatisticsScreen />);
    expect(screen.getByText('Nenhum treino neste período.')).toBeTruthy();
    expect(screen.getByText('precisa de ao menos 2 treinos')).toBeTruthy();
  });

  it('sem nenhum treino registrado', async () => {
    mockHook.mockReturnValue(state({ hasAnySession: false, count: 0, programs: [] }));
    await render(<StatisticsScreen />);
    expect(
      screen.getByText('Complete seu primeiro treino para começar a acompanhar sua frequência.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para o treino' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('erro e tentar de novo', async () => {
    const s = state(null, { status: 'error' });
    mockHook.mockReturnValue(s);
    await render(<StatisticsScreen />);
    expect(screen.getByText('Não foi possível carregar as estatísticas')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(s.reload).toHaveBeenCalled();
  });

  it('filtro por programa', async () => {
    const s = state({ programFilter: 2 }, { programFilter: 2 });
    mockHook.mockReturnValue(s);
    await render(<StatisticsScreen />);
    expect(screen.getByLabelText('Estatísticas, filtro: Treino Monstro')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Filtro: Treino Monstro' }));
    await fireEvent.press(screen.getByText('Todos'));
    expect(s.setProgramFilter).toHaveBeenCalledWith(null);
  });
});
