import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SessionInProgressError } from '@/application/errors';
import ProgramScreen from '@/app/settings/program';
import ScheduleScreen from '@/app/settings/schedule';
import SequenceScreen from '@/app/settings/sequence';
import SettingsScreen from '@/app/(tabs)/settings';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (...a: unknown[]) => mockPush(...a) } }));

const mockHook = jest.fn();
jest.mock('@/hooks/useSettings', () => ({ useSettings: () => mockHook() }));

const programs = [
  { id: 1, name: 'Treino Padrão', description: '5 treinos em sequência', active: true },
  { id: 2, name: 'Treino Monstro', description: 'A/B/C/D', active: true },
];

function state(over: Record<string, unknown> = {}) {
  return {
    settings: { activeProgramId: 1, sequenceType: 'CONTINUOUS' },
    inProgress: null,
    programs,
    agenda: { kind: 'NO_SCHEDULE' },
    selectProgram: jest.fn().mockResolvedValue(undefined),
    selectSequenceStrategy: jest.fn().mockResolvedValue(undefined),
    resetSequence: jest.fn().mockResolvedValue(undefined),
    discardInProgress: jest.fn().mockResolvedValue(undefined),
    ...over,
  };
}

beforeEach(() => {
  mockPush.mockClear();
});

describe('Programa', () => {
  it('lista programas, marca o ativo e troca ao tocar', async () => {
    const s = state();
    mockHook.mockReturnValue(s);
    await render(<ProgramScreen />);
    expect(screen.getByText('Trocar de programa não apaga seu histórico.')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Treino Padrão', selected: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Treino Monstro' }));
    expect(s.selectProgram).toHaveBeenCalledWith(2);
  });

  it('com sessão em andamento abre o sheet; continuar navega; descartar confirma', async () => {
    const s = state({
      selectProgram: jest.fn().mockRejectedValue(new SessionInProgressError(9, 1, 'Treino A')),
    });
    mockHook.mockReturnValue(s);
    await render(<ProgramScreen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Treino Monstro' }));
    await screen.findByText(/Há um treino em andamento/);
    await fireEvent.press(screen.getByRole('button', { name: 'Descartar' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(s.discardInProgress).not.toHaveBeenCalled();
    await fireEvent.press(await screen.findByRole('button', { name: 'Descartar' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Descartar treino' }));
    await waitFor(() => expect(s.discardInProgress).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByRole('radio', { name: 'Treino Monstro' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Continuar' }));
    expect(mockPush).toHaveBeenCalledWith('/workout');
  });
});

describe('Tipo de sequência', () => {
  it('alterna para WEEKLY', async () => {
    const s = state();
    mockHook.mockReturnValue(s);
    await render(<SequenceScreen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Dias da semana' }));
    expect(s.selectSequenceStrategy).toHaveBeenCalledWith('WEEKLY');
  });

  it('WEEKLY sem agenda mostra orientação e atalho para contínua', async () => {
    const s = state({ settings: { activeProgramId: 1, sequenceType: 'WEEKLY' } });
    mockHook.mockReturnValue(s);
    await render(<SequenceScreen />);
    expect(screen.getByText('Este programa não tem agenda semanal')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para sequência contínua' }));
    expect(s.selectSequenceStrategy).toHaveBeenCalledWith('CONTINUOUS');
  });
});

describe('Agenda', () => {
  it('mostra 7 dias somente leitura', async () => {
    mockHook.mockReturnValue(
      state({
        settings: { activeProgramId: 2, sequenceType: 'WEEKLY' },
        agenda: {
          kind: 'DAYS',
          days: [1, 2, 3, 4, 5, 6, 7].map((weekday) =>
            weekday === 3
              ? { weekday, kind: 'REST' }
              : weekday >= 6
                ? { weekday, kind: 'OPTIONAL', note: 'Abdominais' }
                : { weekday, kind: 'WORKOUT', workoutName: 'Treino A' },
          ),
        },
      }),
    );
    await render(<ScheduleScreen />);
    expect(screen.getByText('AGENDA · TREINO MONSTRO')).toBeTruthy();
    expect(screen.getByText('Domingo')).toBeTruthy();
    expect(screen.getByText('Descanso')).toBeTruthy();
    expect(screen.queryByText('›')).toBeNull();
  });

  it('Padrão mostra estado vazio', async () => {
    mockHook.mockReturnValue(state());
    await render(<ScheduleScreen />);
    expect(screen.getByText('Este programa não tem agenda semanal')).toBeTruthy();
    expect(screen.queryByText('Segunda')).toBeNull();
  });
});

describe('Configurações', () => {
  it('mostra valores atuais, agenda em qualquer tipo e Reiniciar só na contínua', async () => {
    mockHook.mockReturnValue(state());
    const { unmount } = await render(<SettingsScreen />);
    expect(screen.getByRole('button', { name: 'Programa de treino, Treino Padrão' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Tipo de sequência, Sequência contínua' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Agenda semanal' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reiniciar sequência' })).toBeTruthy();
    await unmount();
    mockHook.mockReturnValue(state({ settings: { activeProgramId: 1, sequenceType: 'WEEKLY' } }));
    await render(<SettingsScreen />);
    expect(screen.getByRole('button', { name: 'Agenda semanal' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reiniciar sequência' })).toBeNull();
  });

  it('reiniciar: cancelar não escreve; confirmar chama resetSequence', async () => {
    const s = state();
    mockHook.mockReturnValue(s);
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar sequência' }));
    expect(await screen.findByText(/Reiniciar a sequência do Treino Padrão\?/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(s.resetSequence).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar sequência' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Reiniciar' }));
    await waitFor(() => expect(s.resetSequence).toHaveBeenCalledTimes(1));
  });

  it('linhas navegam para as telas empilhadas', async () => {
    mockHook.mockReturnValue(state());
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Agenda semanal' }));
    expect(mockPush).toHaveBeenCalledWith('/settings/schedule');
  });
});
