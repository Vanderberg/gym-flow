import type { Database } from '../data/database/Database';
import { createRepositories } from '../data/repositories';
import { NotFoundError, ValidationError } from '../data/repositories/errors';
import type { SessionRepository } from '../domain/session/SessionRepository';

/** Marca/desmarca (estado alvo, idempotente); com peso pendente grava tudo numa transação. */
export class SetExerciseCompleted {
  constructor(private readonly deps: { sessions: SessionRepository; db?: Database }) {}

  async execute(input: {
    sessionId: number;
    exerciseId: number;
    completed: boolean;
    pendingWeight?: number | null;
  }): Promise<void> {
    const { sessions, db } = this.deps;
    const s = await sessions.getSession(input.sessionId);
    if (!s) throw new NotFoundError('Sessão não encontrada');
    if (s.finishedAt !== null) throw new ValidationError('Sessão finalizada não pode ser editada');
    if (input.pendingWeight === undefined) {
      await sessions.setExerciseCompleted(input.sessionId, input.exerciseId, input.completed);
      return;
    }
    const write = async (repo: SessionRepository) => {
      await repo.setExerciseWeight(input.sessionId, input.exerciseId, input.pendingWeight ?? null);
      await repo.setExerciseCompleted(input.sessionId, input.exerciseId, input.completed);
    };
    if (db) await db.transaction((tx) => write(createRepositories(tx).sessions));
    else await write(sessions);
  }
}
