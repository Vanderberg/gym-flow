import { NotFoundError } from '../data/repositories/errors';
import type { SessionDetail } from '../domain/history/types';
import type { SessionRepository } from '../domain/session/SessionRepository';
import { formatDuration } from '../utils/duration';
import { localDateOf } from '../utils/localDate';

/** Detalhe de uma sessão finalizada (BL-072). Somente leitura. */
export class GetSessionDetail {
  constructor(private readonly deps: { sessions: SessionRepository }) {}

  async execute(sessionId: number): Promise<SessionDetail> {
    const d = await this.deps.sessions.getFinishedDetail(sessionId);
    if (!d) throw new NotFoundError('Sessão finalizada não encontrada');
    const inW = d.rows
      .filter((r) => r.inWorkout)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const out = d.rows.filter((r) => !r.inWorkout).sort((a, b) => a.name.localeCompare(b.name));
    return {
      sessionId: d.sessionId,
      program: { id: d.programId, name: d.programName },
      workout: { id: d.workoutId, code: d.workoutCode, name: d.workoutName },
      finishedAt: d.finishedAt,
      localDate: localDateOf(d.finishedAt),
      durationLabel: formatDuration(d.startedAt, d.finishedAt),
      done: d.rows.filter((r) => r.completed).length,
      total: d.rows.length,
      rows: [...inW, ...out].map((r) => ({
        exerciseId: r.exerciseId,
        name: r.name,
        completed: r.completed,
        weight: r.weight,
        prescription: r.inWorkout ? r.prescription : null,
        technique: r.inWorkout ? r.technique : null,
        notes: r.inWorkout ? r.notes : null,
        inWorkout: r.inWorkout,
      })),
    };
  }
}
