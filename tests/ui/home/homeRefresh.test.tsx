import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useHome } from '@/hooks/useHome';
import { useHomeStore } from '@/store/homeStore';

jest.setTimeout(30000);

const mockExecute = jest.fn();
const mockStart = jest.fn();
const mockDb = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (cb: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').useEffect(cb, [cb]);
  },
}));
jest.mock('@/data/database/DatabaseProvider', () => ({ useDatabase: () => mockDb }));
jest.mock('@/data/repositories', () => ({ createRepositories: () => ({}) }));
jest.mock('@/application/composition', () => ({ createSequenceResolver: () => ({}) }));
jest.mock('@/application/GetHomeState', () => ({
  GetHomeState: class {
    execute = mockExecute;
  },
}));
jest.mock('@/application/StartWorkout', () => ({
  StartWorkout: class {
    execute = mockStart;
  },
}));

const view = (localDate: string) => ({
  program: { id: 1, name: 'P' },
  sequenceType: 'CONTINUOUS',
  indicator: { kind: 'NONE' },
  card: { kind: 'NO_WORKOUTS' },
  suggestion: null,
  localDate,
  browsableWorkouts: [],
});

describe('reavaliação da Home', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockStart.mockReset();
    useHomeStore.setState({ view: null, status: 'loading', pendingDialogShown: false });
  });

  it('recarrega ao focar e ao voltar ao app (nova data local), sem criar sessão', async () => {
    let listener: (s: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _: string,
      cb: (s: string) => void,
    ) => {
      listener = cb;
      return { remove: jest.fn() };
    }) as never);
    mockExecute.mockResolvedValueOnce(view('2026-09-20'));
    renderHook(() => useHome());
    await waitFor(() => expect(useHomeStore.getState().view?.localDate).toBe('2026-09-20'));

    mockExecute.mockResolvedValueOnce(view('2026-09-21'));
    await act(async () => listener('active'));
    await waitFor(() => expect(useHomeStore.getState().view?.localDate).toBe('2026-09-21'));
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('falha de leitura leva ao estado de erro', async () => {
    mockExecute.mockRejectedValueOnce(new Error('x'));
    renderHook(() => useHome());
    await waitFor(() => expect(useHomeStore.getState().status).toBe('error'));
  });
});
