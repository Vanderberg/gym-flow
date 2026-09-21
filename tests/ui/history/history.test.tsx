import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import HistoryScreen from '@/app/(tabs)/history';
import SessionDetailScreen from '@/app/history/[sessionId]';
import { FilterSelect } from '@/components/common/FilterSelect';
import { useHistoryStore } from '@/store/historyStore';
import { useSessionEdit } from '@/hooks/useSessionEdit';

const mockList = jest.fn();
jest.mock('@/hooks/useHistoryList', () => ({ useHistoryList: () => mockList() }));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ sessionId: '5' }),
  useNavigation: () => ({ addListener: () => () => undefined, dispatch: jest.fn() }),
}));
jest.mock('@/hooks/useSessionEdit', () => ({ useSessionEdit: jest.fn() }));
jest.setTimeout(30000);

const item = {
  sessionId: 5,
  programId: 1,
  programName: 'Treino Padrão',
  workoutCode: '1',
  workoutName: 'Peito e Tríceps',
  startedAt: '',
  finishedAt: '',
  done: 7,
  total: 9,
  localDate: '2026-09-10',
  durationLabel: '52 min',
  complete: false,
};
const base = { programs: [], reload: jest.fn(), items: [], programFilter: null };

describe('Histórico (lista)', () => {
  it('mostra mês, item e navega ao detalhe', async () => {
    mockList.mockReturnValue({
      ...base,
      status: 'ready',
      sections: [{ key: '2026-09', label: 'SETEMBRO 2026', items: [item] }],
    });
    await render(<HistoryScreen />);
    expect(screen.getByText('SETEMBRO 2026')).toBeTruthy();
    expect(screen.getByText('1 — Peito e Tríceps')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Peito e Tríceps/ }));
    expect(router.push).toHaveBeenCalledWith('/history/5');
  });
  it('vazio', async () => {
    mockList.mockReturnValue({ ...base, status: 'ready', sections: [] });
    await render(<HistoryScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para o treino' }));
    expect(router.navigate).toHaveBeenCalledWith('/');
  });
  it('erro', async () => {
    mockList.mockReturnValue({ ...base, status: 'error', sections: [] });
    await render(<HistoryScreen />);
    expect(screen.getByText('Não foi possível carregar o histórico')).toBeTruthy();
  });
  it('filtro vazio oferece limpar', async () => {
    useHistoryStore.setState({ programFilter: 2 });
    mockList.mockReturnValue({ ...base, status: 'ready', sections: [], programFilter: 2 });
    await render(<HistoryScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar filtro' }));
    expect(useHistoryStore.getState().programFilter).toBeNull();
  });
});

describe('FilterSelect', () => {
  it('abre a lista e escolhe', async () => {
    const onChange = jest.fn();
    await render(
      <FilterSelect options={[{ id: 1, name: 'Padrão' }]} value={null} onChange={onChange} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Filtro: Todos' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Padrão' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe('Detalhe', () => {
  const row = {
    exerciseId: 1,
    name: 'Supino',
    completed: true,
    weight: 80,
    prescription: '3x10',
    technique: null,
    notes: null,
    inWorkout: true,
  };
  const detail = {
    sessionId: 5,
    program: { id: 1, name: 'Treino Padrão' },
    workout: { id: 1, code: '1', name: 'Peito' },
    finishedAt: '',
    localDate: '2026-09-10',
    durationLabel: '52 min',
    done: 1,
    total: 2,
    rows: [row, { ...row, exerciseId: 2, name: 'Crucifixo', completed: false, weight: null }],
  };
  const hook = (over = {}) => ({
    detail,
    failed: false,
    editing: false,
    rows: detail.rows,
    dirty: false,
    canSave: true,
    saveError: null,
    reload: jest.fn(),
    startEdit: jest.fn(),
    save: jest.fn(),
    toggle: jest.fn(),
    setWeight: jest.fn(),
    discard: jest.fn(),
    ...over,
  });
  it('somente leitura', async () => {
    (useSessionEdit as jest.Mock).mockReturnValue(hook());
    await render(<SessionDetailScreen />);
    expect(screen.getByText('1 — Peito')).toBeTruthy();
    expect(screen.getByText('10/09/2026')).toBeTruthy();
    expect(screen.getByText('1 / 2 realizados')).toBeTruthy();
    expect(screen.getByText('80 kg')).toBeTruthy();
    expect(screen.getByText('não realizado')).toBeTruthy();
    expect(screen.getAllByText('3x10').length).toBeGreaterThan(0);
  });
  it('edição: Cancelar com alterações pede confirmação', async () => {
    const h = hook({ editing: true, dirty: true });
    (useSessionEdit as jest.Mock).mockReturnValue(h);
    await render(<SessionDetailScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(h.save).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('Descartar as alterações?')).toBeTruthy();
    expect(h.discard).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Descartar' }));
    expect(h.discard).toHaveBeenCalled();
  });
});
