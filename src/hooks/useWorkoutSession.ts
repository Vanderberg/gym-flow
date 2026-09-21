import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FinishWorkout } from '@/application/FinishWorkout';
import { GetWorkoutSession } from '@/application/GetWorkoutSession';
import { SetExerciseCompleted } from '@/application/SetExerciseCompleted';
import { SetExerciseWeight } from '@/application/SetExerciseWeight';
import type { Database } from '@/data/database/Database';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import { ConflictError } from '@/data/repositories/errors';
import { formatWeight, parseWeightInput } from '@/domain/workout/weight';
import { useWorkoutStore } from '@/store/workoutStore';

export const WEIGHT_STEP = 2.5;
export const INVALID_WEIGHT_MESSAGE = 'Informe um valor maior ou igual a 0';
const SAVE_ERROR = 'Não foi possível salvar.';

/** Fachada da tela de treino: delega aos casos de uso; sem regra de negócio (BL-060..066). */
export function useWorkoutSession() {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const view = useWorkoutStore((s) => s.view);
  const status = useWorkoutStore((s) => s.status);
  const expanded = useWorkoutStore((s) => s.expanded);
  const drafts = useWorkoutStore((s) => s.drafts);
  const cardErrors = useWorkoutStore((s) => s.cardErrors);

  const load = useCallback(async () => {
    const store = useWorkoutStore.getState();
    if (!store.view) store.setStatus('loading');
    try {
      const next = await new GetWorkoutSession(repos).execute();
      if (next) useWorkoutStore.getState().setView(next);
      else useWorkoutStore.getState().setStatus('noSession');
    } catch {
      useWorkoutStore.getState().setStatus('error');
    }
  }, [repos]);

  const toggleExpanded = useCallback((exerciseId: number, current: boolean) => {
    useWorkoutStore.getState().toggleExpanded(exerciseId, current);
  }, []);

  const setDraft = useCallback((exerciseId: number, text: string) => {
    const st = useWorkoutStore.getState();
    st.setDraft(exerciseId, text);
    st.clearCardError(exerciseId);
  }, []);

  const saveWeight = useCallback(
    async (exerciseId: number, textOverride?: string) => {
      const st = useWorkoutStore.getState();
      const text = textOverride ?? st.drafts[exerciseId];
      if (text === undefined || !st.view) return;
      if (!parseWeightInput(text).ok) {
        st.setCardError(exerciseId, INVALID_WEIGHT_MESSAGE);
        return;
      }
      try {
        await new SetExerciseWeight(repos).execute({
          sessionId: st.view.sessionId,
          exerciseId,
          text,
        });
        useWorkoutStore.getState().clearDraft(exerciseId);
        useWorkoutStore.getState().clearCardError(exerciseId);
        await load();
      } catch {
        useWorkoutStore.getState().setDraft(exerciseId, text);
        useWorkoutStore.getState().setCardError(exerciseId, SAVE_ERROR);
      }
    },
    [repos, load],
  );

  const adjustWeight = useCallback(
    async (exerciseId: number, delta: number) => {
      const st = useWorkoutStore.getState();
      const item = st.view?.items.find((i) => i.exerciseId === exerciseId);
      if (!item) return;
      const parsed = parseWeightInput(st.drafts[exerciseId] ?? formatWeight(item.weight));
      const base = parsed.ok && parsed.value !== null ? parsed.value : 0;
      const next = Math.max(0, Math.round((base + delta) * 100) / 100);
      const text = formatWeight(next);
      st.setDraft(exerciseId, text);
      await saveWeight(exerciseId, text);
    },
    [saveWeight],
  );

  const applyLastWeight = useCallback(
    async (exerciseId: number) => {
      const st = useWorkoutStore.getState();
      const item = st.view?.items.find((i) => i.exerciseId === exerciseId);
      if (!item || item.lastWeight === null) return;
      const text = formatWeight(item.lastWeight);
      st.setDraft(exerciseId, text);
      await saveWeight(exerciseId, text);
    },
    [saveWeight],
  );

  const setCompleted = useCallback(
    async (exerciseId: number, completed: boolean) => {
      const st = useWorkoutStore.getState();
      if (!st.view) return;
      const draft = st.drafts[exerciseId];
      const parsed = draft === undefined ? null : parseWeightInput(draft);
      if (parsed && !parsed.ok) {
        st.setCardError(exerciseId, INVALID_WEIGHT_MESSAGE);
        return;
      }
      try {
        await new SetExerciseCompleted({ ...repos, db }).execute({
          sessionId: st.view.sessionId,
          exerciseId,
          completed,
          ...(parsed && parsed.ok ? { pendingWeight: parsed.value } : {}),
        });
        useWorkoutStore.getState().clearDraft(exerciseId);
        useWorkoutStore.getState().clearCardError(exerciseId);
        await load();
      } catch {
        useWorkoutStore.getState().setCardError(exerciseId, SAVE_ERROR);
      }
    },
    [repos, db, load],
  );

  return {
    view,
    status,
    expanded,
    drafts,
    cardErrors,
    load,
    toggleExpanded,
    setDraft,
    saveWeight,
    adjustWeight,
    applyLastWeight,
    setCompleted,
    finish: useFinish(db, repos),
  };
}

type Repos = ReturnType<typeof createRepositories>;

/** Devolve true se finalizou (ou já estava finalizada) e navegou ao resumo. */
function useFinish(db: Database, repos: Repos) {
  return useCallback(async (): Promise<boolean> => {
    const st = useWorkoutStore.getState();
    if (!st.view) return false;
    const sessionId = st.view.sessionId;
    const pendingWeights: Record<number, number | null> = {};
    for (const [id, text] of Object.entries(st.drafts)) {
      const parsed = parseWeightInput(text);
      if (parsed.ok) pendingWeights[Number(id)] = parsed.value;
    }
    const goToSummary = () => {
      useWorkoutStore.getState().reset();
      router.replace({ pathname: '/workout/summary', params: { sessionId: String(sessionId) } });
    };
    try {
      await new FinishWorkout({ db, settings: repos.settings }).execute({
        sessionId,
        pendingWeights,
      });
      goToSummary();
      return true;
    } catch (e) {
      if (e instanceof ConflictError) {
        goToSummary();
        return true;
      }
      return false;
    }
  }, [db, repos]);
}
