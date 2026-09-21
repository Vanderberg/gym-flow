import { useCallback, useEffect, useMemo } from 'react';
import { DiscardInProgressSession } from '@/application/DiscardInProgressSession';
import { ResetSequence } from '@/application/ResetSequence';
import { SelectProgram } from '@/application/SelectProgram';
import { SelectSequenceStrategy } from '@/application/SelectSequenceStrategy';
import { createRepositories } from '@/data/repositories';
import { useDatabase } from '@/data/database/DatabaseProvider';
import type { SequenceType } from '@/domain/settings/types';
import { useSettingsStore } from '@/store/settingsStore';

/** Fachada das telas de Configurações: delega aos casos de uso e recarrega após cada escrita. */
export function useSettings() {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const settings = useSettingsStore((s) => s.settings);
  const inProgress = useSettingsStore((s) => s.inProgress);
  const programs = useSettingsStore((s) => s.programs);
  const agenda = useSettingsStore((s) => s.agenda);
  const storeReload = useSettingsStore((s) => s.reload);

  const reload = useCallback(async () => {
    try {
      await storeReload(repos);
    } catch {
      // leitura falhou: mantém o último estado exibido
    }
  }, [storeReload, repos]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const selectProgram = useCallback(
    async (programId: number) => {
      await new SelectProgram(repos).execute(programId);
      await reload();
    },
    [repos, reload],
  );
  const selectSequenceStrategy = useCallback(
    async (type: SequenceType) => {
      await new SelectSequenceStrategy(repos).execute(type);
      await reload();
    },
    [repos, reload],
  );
  const resetSequence = useCallback(async () => {
    const current = useSettingsStore.getState().settings;
    if (!current) return;
    await new ResetSequence(repos).execute(current.activeProgramId);
    await reload();
  }, [repos, reload]);
  const discardInProgress = useCallback(async () => {
    await new DiscardInProgressSession(repos).execute();
    await reload();
  }, [repos, reload]);

  return {
    settings,
    inProgress,
    programs,
    agenda,
    reload,
    selectProgram,
    selectSequenceStrategy,
    resetSequence,
    discardInProgress,
  };
}
