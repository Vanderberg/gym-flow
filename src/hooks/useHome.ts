import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { DiscardInProgressSession } from '@/application/DiscardInProgressSession';
import { GetHomeState } from '@/application/GetHomeState';
import { SelectSequenceStrategy } from '@/application/SelectSequenceStrategy';
import { StartWorkout } from '@/application/StartWorkout';
import { createSequenceResolver } from '@/application/composition';
import { ConflictError } from '@/data/repositories/errors';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import { useHomeStore } from '@/store/homeStore';

/** Fachada da Home: delega aos casos de uso; sem regra de negócio (BL-050..053). */
export function useHome() {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const view = useHomeStore((s) => s.view);
  const status = useHomeStore((s) => s.status);
  const pendingDialogShown = useHomeStore((s) => s.pendingDialogShown);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const store = useHomeStore.getState();
    if (!store.view) store.setLoading();
    try {
      const next = await new GetHomeState({
        ...repos,
        resolver: createSequenceResolver(),
        clock: () => new Date(),
      }).execute();
      useHomeStore.getState().setView(next);
    } catch {
      useHomeStore.getState().setError();
    }
  }, [repos]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      // Recarrega sempre ao voltar ao app: a resolução usa a data local atual (virada de dia).
      void reload();
    });
    return () => sub.remove();
  }, [reload]);

  const start = useCallback(
    async (workoutId: number) => {
      try {
        await new StartWorkout(repos).execute(workoutId);
        setNotice(null);
        router.push('/workout');
      } catch (e) {
        if (e instanceof ConflictError) {
          setNotice('Já existe um treino em andamento');
          await reload();
          return;
        }
        throw e;
      }
    },
    [repos, reload],
  );
  const continueWorkout = useCallback(() => router.push('/workout'), []);
  const discard = useCallback(async () => {
    await new DiscardInProgressSession(repos).execute();
    await reload();
  }, [repos, reload]);
  const switchToContinuous = useCallback(async () => {
    await new SelectSequenceStrategy(repos).execute('CONTINUOUS');
    await reload();
  }, [repos, reload]);

  return {
    view,
    status,
    notice,
    pendingDialogShown,
    reload,
    start,
    continueWorkout,
    discard,
    switchToContinuous,
    markDialogShown: useHomeStore.getState().markDialogShown,
  };
}
