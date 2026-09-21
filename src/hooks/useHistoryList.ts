import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ListHistory } from '@/application/ListHistory';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import { groupByMonth } from '@/domain/history/groupByMonth';
import type { HistoryItem } from '@/domain/history/types';
import { useHistoryStore } from '@/store/historyStore';

export function useHistoryList() {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const programFilter = useHistoryStore((s) => s.programFilter);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [programs, setPrograms] = useState<{ id: number; name: string }[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const reload = useCallback(async () => {
    try {
      const [list, progs] = await Promise.all([
        new ListHistory(repos).execute(
          programFilter === null ? undefined : { programId: programFilter },
        ),
        repos.sessions.listProgramsWithFinished(),
      ]);
      setItems(list);
      setPrograms(progs);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [repos, programFilter]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const sections = useMemo(() => groupByMonth(items), [items]);
  return { items, sections, programs, status, reload, programFilter };
}
