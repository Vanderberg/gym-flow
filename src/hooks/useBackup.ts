import { useCallback, useMemo, useRef, useState } from 'react';
import { ConfirmImportBackup } from '@/application/ConfirmImportBackup';
import { DiscardInProgressSession } from '@/application/DiscardInProgressSession';
import { ExportBackup } from '@/application/ExportBackup';
import { PrepareImportBackup } from '@/application/PrepareImportBackup';
import {
  ExpoBackupFileGateway,
  SharingUnavailableError,
} from '@/data/backup/ExpoBackupFileGateway';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import {
  BackupBlockedByInProgressSessionError,
  BackupValidationError,
  type BackupDocument,
  type BackupErrorKind,
  type BackupSummary,
} from '@/domain/backup/types';
import { useSettingsStore } from '@/store/settingsStore';

export interface BackupNotice {
  title: string;
  message: string;
}

const EXPORT_FAILED: BackupNotice = {
  title: 'Não foi possível exportar',
  message: 'Não foi possível gerar o arquivo de backup. Tente de novo.',
};
const SHARING_UNAVAILABLE: BackupNotice = {
  title: 'Compartilhamento indisponível',
  message: 'Este aparelho não permite compartilhar arquivos.',
};
const RESTORE_FAILED: BackupNotice = {
  title: 'Não foi possível restaurar',
  message: 'Ocorreu um erro e seus dados continuam como estavam.',
};

const INVALID_FILE: BackupNotice = {
  title: 'Arquivo inválido',
  message: 'Este arquivo não é um backup do Gym Flow ou está corrompido. Nada foi alterado.',
};
const NOTICE_BY_KIND: Record<BackupErrorKind, BackupNotice> = {
  INVALID_FORMAT: INVALID_FILE,
  INVALID_VALUE: INVALID_FILE,
  UNSUPPORTED_VERSION: {
    title: 'Versão não suportada',
    message:
      'Este backup é de uma versão mais recente do app. Atualize o Gym Flow e tente de novo. Nada foi alterado.',
  },
  UNKNOWN_REFERENCE: {
    title: 'Backup incompatível',
    message:
      'Este backup usa programas ou exercícios que não existem nesta versão do app. Nada foi alterado.',
  },
};

const restored = (count: number): BackupNotice => ({
  title: 'Backup restaurado',
  message: count === 1 ? '1 treino restaurado.' : `${count} treinos restaurados.`,
});

interface Pending {
  document: BackupDocument;
  summary: BackupSummary;
}

/** Fachada da seção Backup em Configurações: delega aos casos de uso e expõe só estado de UI. */
export function useBackup() {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const gateway = useMemo(() => new ExpoBackupFileGateway(), []);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<BackupNotice | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [blocked, setBlocked] = useState(false);
  // ref síncrona: o estado `busy` só atualiza no próximo render, depois de um segundo toque
  const running = useRef(false);

  /** Uma operação por vez; devolve `false` se já havia outra em andamento. */
  const run = useCallback(async (work: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    try {
      await work();
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, []);

  /** Treino em andamento abre o bloqueio; arquivo recusado e falhas viram um aviso. */
  const reportRestoreError = useCallback((e: unknown) => {
    if (e instanceof BackupBlockedByInProgressSessionError) setBlocked(true);
    else if (e instanceof BackupValidationError) setNotice(NOTICE_BY_KIND[e.kind]);
    else setNotice(RESTORE_FAILED);
  }, []);

  const exportBackup = useCallback(
    () =>
      run(async () => {
        try {
          await new ExportBackup({ backup: repos.backup, gateway }).execute();
        } catch (e) {
          setNotice(e instanceof SharingUnavailableError ? SHARING_UNAVAILABLE : EXPORT_FAILED);
        }
      }),
    [run, repos, gateway],
  );

  const importBackup = useCallback(
    () =>
      run(async () => {
        try {
          const result = await new PrepareImportBackup({
            backup: repos.backup,
            gateway,
          }).execute();
          if (result.status === 'READY') setPending(result);
        } catch (e) {
          reportRestoreError(e);
        }
      }),
    [run, repos, gateway, reportRestoreError],
  );

  const confirmImport = useCallback(
    () =>
      run(async () => {
        if (!pending) return;
        const { document, summary } = pending;
        setPending(null);
        try {
          await new ConfirmImportBackup({ backup: repos.backup }).execute(document);
          // Home, Histórico e Estatísticas recarregam ao ganhar foco; Configurações, aqui
          await useSettingsStore.getState().reload(repos);
          setNotice(restored(summary.sessionCount));
        } catch (e) {
          reportRestoreError(e);
        }
      }),
    [run, pending, repos, reportRestoreError],
  );

  const discardInProgress = useCallback(async () => {
    await new DiscardInProgressSession({ sessions: repos.sessions }).execute();
    await useSettingsStore.getState().reload(repos);
    setBlocked(false);
  }, [repos]);

  const cancelImport = useCallback(() => setPending(null), []);
  const dismissBlocked = useCallback(() => setBlocked(false), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return {
    busy,
    notice,
    pendingImport: pending?.summary ?? null,
    blocked,
    dismissNotice,
    dismissBlocked,
    discardInProgress,
    exportBackup,
    importBackup,
    confirmImport,
    cancelImport,
  };
}
