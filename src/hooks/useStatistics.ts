import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { GetStatistics } from '@/application/GetStatistics';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import type { StatisticsView } from '@/domain/statistics/types';
import { useStatisticsStore } from '@/store/statisticsStore';

/** Fachada da aba Estatísticas; sem regra de negócio (BL-080..087). */
export function useStatistics() {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const period = useStatisticsStore((s) => s.period);
  const programFilter = useStatisticsStore((s) => s.programFilter);
  const [view, setView] = useState<StatisticsView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const reload = useCallback(async () => {
    try {
      const service = new GetStatistics({ sessions: repos.sessions, clock: () => new Date() });
      setView(await service.execute({ period, programId: programFilter }));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [repos, period, programFilter]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload();
    });
    return () => sub.remove();
  }, [reload]);

  return {
    view,
    status,
    period,
    programFilter,
    reload,
    setPeriod: useStatisticsStore.getState().setPeriod,
    setProgramFilter: useStatisticsStore.getState().setProgramFilter,
  };
}
