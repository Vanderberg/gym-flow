import { act, renderHook } from '@testing-library/react-native';
import { SharingUnavailableError } from '@/data/backup/ExpoBackupFileGateway';
import { useBackup } from '@/hooks/useBackup';

const mockExport = jest.fn();
const mockPrepare = jest.fn();
const mockConfirm = jest.fn();
const mockReload = jest.fn();

jest.mock('@/data/database/DatabaseProvider', () => ({ useDatabase: () => ({}) }));
jest.mock('@/data/repositories', () => ({
  createRepositories: () => ({ backup: {}, settings: {} }),
}));
jest.mock('@/store/settingsStore', () => ({
  useSettingsStore: { getState: () => ({ reload: mockReload }) },
}));
jest.mock('@/data/backup/ExpoBackupFileGateway', () => {
  class SharingUnavailableError extends Error {}
  return { SharingUnavailableError, ExpoBackupFileGateway: class {} };
});
jest.mock('@/application/ExportBackup', () => ({
  ExportBackup: class {
    execute() {
      return mockExport();
    }
  },
}));
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

beforeEach(() => {
  mockExport.mockReset();
  mockPrepare.mockReset();
  mockConfirm.mockReset();
  mockReload.mockReset().mockResolvedValue(undefined);
});

describe('useBackup.exportBackup', () => {
  it('conclui sem aviso e volta a ficar livre', async () => {
    mockExport.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.exportBackup();
    });
    expect(result.current.notice).toBeNull();
    expect(result.current.busy).toBe(false);
  });

  it('falha genérica vira o aviso "Não foi possível exportar"', async () => {
    mockExport.mockRejectedValue(new Error('x'));
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.exportBackup();
    });
    expect(result.current.notice).toEqual({
      title: 'Não foi possível exportar',
      message: 'Não foi possível gerar o arquivo de backup. Tente de novo.',
    });
    await act(async () => result.current.dismissNotice());
    expect(result.current.notice).toBeNull();
  });

  it('compartilhamento indisponível tem aviso próprio', async () => {
    mockExport.mockRejectedValue(new SharingUnavailableError());
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.exportBackup();
    });
    expect(result.current.notice?.title).toBe('Compartilhamento indisponível');
  });

  it('ignora um segundo toque enquanto a operação está em andamento', async () => {
    let finish: () => void = () => undefined;
    mockExport.mockReturnValue(new Promise<void>((r) => (finish = r)));
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      void result.current.exportBackup();
      void result.current.exportBackup();
    });
    expect(mockExport).toHaveBeenCalledTimes(1);
    await act(async () => finish());
  });
});

describe('useBackup — importar', () => {
  const document = { format: 'gymflow-backup' };
  const summary = { sessionCount: 12, firstDate: '2026-09-01', lastDate: '2026-09-30' };

  it('arquivo válido deixa o resumo pendente, sem restaurar ainda', async () => {
    mockPrepare.mockResolvedValue({ status: 'READY', document, summary });
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    expect(result.current.pendingImport).toEqual(summary);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('cancelar o seletor não mostra nada', async () => {
    mockPrepare.mockResolvedValue({ status: 'CANCELLED' });
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    expect(result.current.pendingImport).toBeNull();
    expect(result.current.notice).toBeNull();
  });

  it('cancelar a confirmação descarta o resumo sem restaurar', async () => {
    mockPrepare.mockResolvedValue({ status: 'READY', document, summary });
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => result.current.cancelImport());
    expect(result.current.pendingImport).toBeNull();
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('confirmar restaura, recarrega as configurações e avisa o sucesso', async () => {
    mockPrepare.mockResolvedValue({ status: 'READY', document, summary });
    mockConfirm.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => {
      await result.current.confirmImport();
    });
    expect(mockConfirm).toHaveBeenCalledWith(document);
    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(result.current.pendingImport).toBeNull();
    expect(result.current.notice).toEqual({
      title: 'Backup restaurado',
      message: '12 treinos restaurados.',
    });
    expect(result.current.busy).toBe(false);
  });

  it('usa o singular com um único treino', async () => {
    mockPrepare.mockResolvedValue({
      status: 'READY',
      document,
      summary: { sessionCount: 1, firstDate: '2026-09-01', lastDate: '2026-09-01' },
    });
    mockConfirm.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => {
      await result.current.confirmImport();
    });
    expect(result.current.notice?.message).toBe('1 treino restaurado.');
  });

  it('falha ao restaurar avisa que os dados continuam como estavam', async () => {
    mockPrepare.mockResolvedValue({ status: 'READY', document, summary });
    mockConfirm.mockRejectedValue(new Error('boom'));
    const { result } = await renderHook(() => useBackup());
    await act(async () => {
      await result.current.importBackup();
    });
    await act(async () => {
      await result.current.confirmImport();
    });
    expect(result.current.notice).toEqual({
      title: 'Não foi possível restaurar',
      message: 'Ocorreu um erro e seus dados continuam como estavam.',
    });
    expect(result.current.pendingImport).toBeNull();
  });
});
