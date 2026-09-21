import type { Database } from '../data/database/Database';
import { createRepositories } from '../data/repositories';
import { ConflictError, NotFoundError } from '../data/repositories/errors';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import { advancePosition } from '../domain/sequence/services/advancePosition';
import type { FinishSummary } from '../domain/workout/types';
import { durationMinutes } from '../utils/duration';
import { nowLocalIso, type Clock } from '../utils/localDate';

/**
 * Finaliza a sessão numa única transação (BL-066): pesos pendentes, finished_at,
 * avanço da sequência contínua e resumo. Qualquer falha desfaz tudo.
 */
export class FinishWorkout {
  constructor(
    private readonly deps: { db: Database; settings: SettingsRepository; clock?: Clock },
  ) {}

  async execute(input: {
    sessionId: number;
    pendingWeights?: Record<number, number | null>;
  }): Promise<FinishSummary> {
    const { db, settings, clock } = this.deps;
    const current = await settings.get();
    if (!current) throw new NotFoundError('Configurações não encontradas');
    return db.transaction(async (tx) => {
      const repos = createRepositories(tx, clock);
      const s = await repos.sessions.getSession(input.sessionId);
      if (!s) throw new NotFoundError('Sessão não encontrada');
      if (s.finishedAt !== null) throw new ConflictError('Sessão já finalizada');
      for (const [id, w] of Object.entries(input.pendingWeights ?? {})) {
        await repos.sessions.setExerciseWeight(s.id, Number(id), w);
      }
      const finishedAt = nowLocalIso(clock);
      await repos.sessions.finishSession(s.id, finishedAt);
      if (current.sequenceType === 'CONTINUOUS') {
        const workout = await repos.programs.getWorkoutWithExercises(s.workoutId);
        const all = await repos.programs.listWorkouts(s.programId);
        const active = all.filter((w) => w.active).map((w) => w.position);
        if (workout && active.length > 0) {
          await repos.sequenceState.upsert(s.programId, advancePosition(workout.position, active));
        }
      }
      return {
        sessionId: s.id,
        done: s.exercises.filter((e) => e.completed).length,
        total: s.exercises.length,
        durationMinutes: durationMinutes(s.startedAt, finishedAt),
      };
    });
  }
}
