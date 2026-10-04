import { fireEvent, render, screen } from '@testing-library/react-native';
import { BackupSection } from '@/components/settings/BackupSection';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockHook = jest.fn();
jest.mock('@/hooks/useBackup', () => ({ useBackup: () => mockHook() }));

function state(over: Record<string, unknown> = {}) {
  return {
    busy: false,
    notice: null,
    pendingImport: null,
    dismissNotice: jest.fn(),
    exportBackup: jest.fn().mockResolvedValue(undefined),
    importBackup: jest.fn().mockResolvedValue(undefined),
    confirmImport: jest.fn().mockResolvedValue(undefined),
    cancelImport: jest.fn(),
    blocked: false,
    dismissBlocked: jest.fn(),
    discardInProgress: jest.fn().mockResolvedValue(undefined),
    ...over,
  };
}

describe('Seção Backup — exportar', () => {
  it('mostra o título e a linha "Exportar dados", que chama o caso de uso ao tocar', async () => {
    const s = state();
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);

    expect(screen.getByText('BACKUP')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Exportar dados' }));
    expect(s.exportBackup).toHaveBeenCalledTimes(1);
  });

  it('desabilita as linhas enquanto a operação está em andamento', async () => {
    mockHook.mockReturnValue(state({ busy: true }));
    await render(<BackupSection />);
    for (const name of ['Exportar dados', 'Importar dados']) {
      expect(screen.getByRole('button', { name }).props.accessibilityState).toMatchObject({
        disabled: true,
      });
    }
  });

  it('não mostra nada quando não há aviso (cancelar a folha não gera erro)', async () => {
    mockHook.mockReturnValue(state());
    await render(<BackupSection />);
    expect(screen.queryByText('Não foi possível exportar')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Entendi' })).toBeNull();
  });

  it('mostra o aviso de falha em um sheet e o fecha com "Entendi"', async () => {
    const s = state({
      notice: {
        title: 'Não foi possível exportar',
        message: 'Não foi possível gerar o arquivo de backup. Tente de novo.',
      },
    });
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);

    expect(screen.getByText('Não foi possível exportar')).toBeTruthy();
    expect(
      screen.getByText('Não foi possível gerar o arquivo de backup. Tente de novo.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));
    expect(s.dismissNotice).toHaveBeenCalledTimes(1);
  });
});

describe('Seção Backup — importar', () => {
  it('a linha "Importar dados" chama o caso de uso ao tocar', async () => {
    const s = state();
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);
    await fireEvent.press(screen.getByRole('button', { name: 'Importar dados' }));
    expect(s.importBackup).toHaveBeenCalledTimes(1);
  });

  it('com resumo pendente mostra a confirmação destrutiva com quantidade e período', async () => {
    mockHook.mockReturnValue(
      state({
        pendingImport: { sessionCount: 12, firstDate: '2026-09-01', lastDate: '2026-09-30' },
      }),
    );
    await render(<BackupSection />);

    expect(screen.getByText('Substituir histórico?')).toBeTruthy();
    expect(
      screen.getByText(
        '12 treinos, de 01/09/2026 a 30/09/2026. Seu histórico atual, a posição na sequência e as configurações serão substituídos. Isso não pode ser desfeito.',
      ),
    ).toBeTruthy();
  });

  it('cancelar não restaura; "Substituir histórico" confirma', async () => {
    const s = state({
      pendingImport: { sessionCount: 3, firstDate: '2026-09-01', lastDate: '2026-09-30' },
    });
    mockHook.mockReturnValue(s);
    await render(<BackupSection />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(s.cancelImport).toHaveBeenCalledTimes(1);
    expect(s.confirmImport).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir histórico' }));
    expect(s.confirmImport).toHaveBeenCalledTimes(1);
  });

  it('um treino só usa o singular e a mesma data', async () => {
    mockHook.mockReturnValue(
      state({
        pendingImport: { sessionCount: 1, firstDate: '2026-09-05', lastDate: '2026-09-05' },
      }),
    );
    await render(<BackupSection />);
    expect(screen.getByText(/^1 treino, em 05\/09\/2026\. Seu histórico atual/)).toBeTruthy();
  });

  it('backup sem treinos avisa que o histórico atual será apagado', async () => {
    mockHook.mockReturnValue(
      state({ pendingImport: { sessionCount: 0, firstDate: null, lastDate: null } }),
    );
    await render(<BackupSection />);
    expect(
      screen.getByText(
        'Este backup não tem treinos. Seu histórico atual será apagado, e a posição na sequência e as configurações serão substituídas. Isso não pode ser desfeito.',
      ),
    ).toBeTruthy();
  });

  it('mostra o sucesso da restauração em um sheet', async () => {
    mockHook.mockReturnValue(
      state({ notice: { title: 'Backup restaurado', message: '12 treinos restaurados.' } }),
    );
    await render(<BackupSection />);
    expect(screen.getByText('Backup restaurado')).toBeTruthy();
    expect(screen.getByText('12 treinos restaurados.')).toBeTruthy();
  });
});
