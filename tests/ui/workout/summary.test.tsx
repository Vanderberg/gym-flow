import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import WorkoutSummaryScreen from '@/app/workout/summary';

const mockSummary = jest.fn();
jest.mock('@/hooks/useFinishSummary', () => ({ useFinishSummary: () => mockSummary() }));
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({ sessionId: '7' }),
}));
jest.setTimeout(30000);

describe('Resumo do treino', () => {
  it('mostra conclusão, duração e volta ao início', async () => {
    mockSummary.mockReturnValue({
      summary: { sessionId: 7, done: 7, total: 9, durationMinutes: 52 },
      failed: false,
    });
    await render(<WorkoutSummaryScreen />);
    expect(screen.getByText('Treino concluído')).toBeTruthy();
    expect(screen.getByText('7 de 9 exercícios realizados')).toBeTruthy();
    expect(screen.getByText('52 min')).toBeTruthy();
    expect(screen.queryByText(/Próximo/)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});
