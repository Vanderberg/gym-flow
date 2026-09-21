import { NotFoundError } from '../data/repositories/errors';
import type { SessionRepository } from '../domain/session/SessionRepository';
import type { FinishSummary } from '../domain/workout/types';
import { durationMinutes } from '../utils/duration';

export class GetFinishSummary {
  constructor(private readonly deps: { sessions: SessionRepository }) {}

  async execute(sessionId: number): Promise<FinishSummary> {
    const s = await this.deps.sessions.getSession(sessionId);
    if (!s || s.finishedAt === null) throw new NotFoundError('Sessão finalizada não encontrada');
    return {
      sessionId: s.id,
      done: s.exercises.filter((e) => e.completed).length,
      total: s.exercises.length,
      durationMinutes: durationMinutes(s.startedAt, s.finishedAt),
    };
  }
}
