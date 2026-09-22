import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { GetContributionGrid } from '@/application/GetContributionGrid';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import type { ContributionGrid } from '@/domain/statistics/contributionGrid';

/** Grade de frequência das últimas 12 semanas para o programa filtrado (Histórico e Estatísticas). */
export function useContributionGrid(programId: number | null) {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const [grid, setGrid] = useState<ContributionGrid | null>(null);

  const reload = useCallback(async () => {
    try {
      const service = new GetContributionGrid({
        sessions: repos.sessions,
        clock: () => new Date(),
      });
      setGrid(await service.execute({ programId }));
    } catch {
      setGrid(null);
    }
  }, [repos, programId]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return grid;
}
