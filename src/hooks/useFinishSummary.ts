import { useEffect, useMemo, useState } from 'react';
import { GetFinishSummary } from '@/application/GetFinishSummary';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import type { FinishSummary } from '@/domain/workout/types';

export function useFinishSummary(sessionId: number) {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const [summary, setSummary] = useState<FinishSummary | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    new GetFinishSummary(repos)
      .execute(sessionId)
      .then(setSummary)
      .catch(() => setFailed(true));
  }, [repos, sessionId]);
  return { summary, failed };
}
