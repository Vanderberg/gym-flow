import { act, renderHook } from '@testing-library/react-native';
import {
  BackupBlockedByInProgressSessionError,
  BackupValidationError,
} from '@/domain/backup/types';
import { useBackup } from '@/hooks/useBackup';

const mockPrepare = jest.fn();
const mockConfirm = jest.fn();
const mockReload = jest.fn();
const mockDiscard = jest.fn();

jest.mock('@/data/database/DatabaseProvider', () => ({ useDatabase: () => ({}) }));
jest.mock('@/data/repositories', () => ({
  createRepositories: () => ({ backup: {}, settings: {}, sessions: {} }),
}));
jest.mock('@/store/settingsStore', () => ({
  useSettingsStore: { getState: () => ({ reload: mockReload }) },
}));
jest.mock('@/data/backup/ExpoBackupFileGateway', () => {
  class SharingUnavailableError extends Error {}
  return { SharingUnavailableError, ExpoBackupFileGateway: class {} };
});
jest.mock('@/application/ExportBackup', () => ({ ExportBackup: class {} }));
jest.mock('@/application/PrepareImportBackup', () => ({
  PrepareImportBackup: class {
    execute() {
      return mockPrepare();
    }
  },
}));
jest.mock('@/application/ConfirmImportBackup', () => ({
  ConfirmImportBackup: class {
    execute(doc: unknown) {
      return mockConfirm(doc);
    }
  },
}));
jest.mock('@/application/DiscardInProgressSession', () => ({
  DiscardInProgressSession: class {
    execute() {
      return mockDiscard();
    }
  },
}));

beforeEach(() => {
  mockPrepare.mockReset();
  mockConfirm.mockReset();
  mockReload.mockReset().mockResolvedValue(undefined);
  mockDiscard.mockReset().mockResolvedValue(undefined);
});

const INVALID_FILE = {
  title: 'Arquivo inválido',
  message: 'Este arquivo não é um backup do Gym Flow ou está corrompido. Nada foi alterado.',
};

describe('useBackup — proteção', () => {
  const document = { format: 'gymflow-backup' };
  const summary = { sessionCount: 2, firstDate: '2026-09-01', lastDate: '2026-09-30' };

  it.each([
    ['INVALID_FORMAT', INVALID_FILE],
    ['INVALID_VALUE', INVALID_FILE],
    [
      'UNSUPPORTED_VERSION',
      {
        title: 'Versão não suportada',
        message:
          'Este backup é de uma versão mais recente do app. Atualize o Gym Flow e tente de novo. Nada foi alterado.',
      },
    ],
    [
      'UNKNOWN_REFERENCE',
      {
        title: 'Backup incompatível',
        message:
          'Este backup usa programas ou exercícios que não existem nesta versão do app. Nada foi alterado.',
      },
    ],
  ] as const)(
    'arquivo recusado (%s) mostra o aviso certo e nada fica pendente',
    async (kind, notice) => {
      mockPrepare.mockRejectedValue(new BackupValidationError(kind, 'x'));
      const { result } = await renderHook(() => useBackup());
      await act(async () => {
        await result.current.importBackup();
      });
      expect(result.current.notice).toEqual(notice);
      expect(result.current.pendingImport).toBeNull();
      expect(result.current.blocked).toBe(false);
    },
  );

  it('erro inesperado ao ler o arquivo vira "Não foi possível restaurar"', async () => {
    mockPrepare.mockRejectedValue(new Error('disco'));
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    expect(result.current.notice?.title).toBe('Não foi possível restaurar');
  });

  it('treino em andamento ao escolher o arquivo abre o bloqueio, sem aviso de erro', async () => {
    mockPrepare.mockRejectedValue(new BackupBlockedByInProgressSessionError());
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    expect(result.current.blocked).toBe(true);
    expect(result.current.notice).toBeNull();
  });

  it('treino iniciado depois do resumo bloqueia na confirmação', async () => {
    mockPrepare.mockResolvedValue({ status: 'READY', document, summary });
    mockConfirm.mockRejectedValue(new BackupBlockedByInProgressSessionError());
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => {
      await result.current.confirmImport();
    });
    expect(result.current.blocked).toBe(true);
    expect(result.current.notice).toBeNull();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('descartar o treino em andamento fecha o bloqueio', async () => {
    mockPrepare.mockRejectedValue(new BackupBlockedByInProgressSessionError());
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => {
      await result.current.discardInProgress();
    });
    expect(mockDiscard).toHaveBeenCalledTimes(1);
    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(false);
  });

  it('fechar o bloqueio não descarta nada', async () => {
    mockPrepare.mockRejectedValue(new BackupBlockedByInProgressSessionError());
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => result.current.dismissBlocked());
    expect(result.current.blocked).toBe(false);
    expect(mockDiscard).not.toHaveBeenCalled();
  });
});
