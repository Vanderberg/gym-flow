import { fireEvent, render, screen } from '@testing-library/react-native';
import { BackupSection } from '@/components/settings/BackupSection';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (...a: unknown[]) => mockPush(...a) } }));

const mockHook = jest.fn();
jest.mock('@/hooks/useBackup', () => ({ useBackup: () => mockHook() }));

function state(over: Record<string, unknown> = {}) {
  return {
    busy: false,
    notice: null,
    pendingImport: null,
    blocked: false,
    dismissNotice: jest.fn(),
    exportBackup: jest.fn().mockResolvedValue(undefined),
    importBackup: jest.fn().mockResolvedValue(undefined),
    confirmImport: jest.fn().mockResolvedValue(undefined),
    cancelImport: jest.fn(),
    dismissBlocked: jest.fn(),
    discardInProgress: jest.fn().mockResolvedValue(undefined),
    ...over,
  };
}

beforeEach(() => mockPush.mockClear());

describe('Seção Backup — treino em andamento', () => {
  it('mostra o bloqueio com a mensagem da importação', async () => {
    mockHook.mockReturnValue(state({ blocked: true }));
    await render(<BackupSection />);
    expect(screen.getByText('Treino em andamento')).toBeTruthy();
    expect(
      screen.getByText('Há um treino em andamento. Finalize ou descarte para importar o backup.'),
    ).toBeTruthy();
  });

  it('"Continuar" fecha o bloqueio e leva ao treino', async () => {
    const s = state({ blocked: true });
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(s.dismissBlocked).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/workout');
  });

  it('"Descartar" só descarta depois da confirmação', async () => {
    const s = state({ blocked: true });
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);
    await fireEvent.press(screen.getByRole('button', { name: 'Descartar' }));
    expect(s.discardInProgress).not.toHaveBeenCalled();
    await fireEvent.press(await screen.findByRole('button', { name: 'Descartar treino' }));
    expect(s.discardInProgress).toHaveBeenCalledTimes(1);
  });

  it('sem bloqueio nem erro, nada disso aparece (cancelar o seletor é silencioso)', async () => {
    mockHook.mockReturnValue(state());
    await render(<BackupSection />);
    expect(screen.queryByText('Treino em andamento')).toBeNull();
    expect(screen.queryByText('Arquivo inválido')).toBeNull();
  });
});

describe('Seção Backup — avisos de erro', () => {
  it.each([
    [
      'Arquivo inválido',
      'Este arquivo não é um backup do Gym Flow ou está corrompido. Nada foi alterado.',
    ],
    [
      'Versão não suportada',
      'Este backup é de uma versão mais recente do app. Atualize o Gym Flow e tente de novo. Nada foi alterado.',
    ],
    [
      'Backup incompatível',
      'Este backup usa programas ou exercícios que não existem nesta versão do app. Nada foi alterado.',
    ],
    ['Não foi possível restaurar', 'Ocorreu um erro e seus dados continuam como estavam.'],
  ])('mostra "%s" em um sheet com "Entendi"', async (title, message) => {
    const s = state({ notice: { title, message } });
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));
    expect(s.dismissNotice).toHaveBeenCalledTimes(1);
  });
});
