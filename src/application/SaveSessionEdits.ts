import { NotFoundError, ValidationError } from '../data/repositories/errors';
import { createRepositories } from '../data/repositories';
import type { Database } from '../data/database/Database';
import type { EditChanges } from '../domain/history/types';

/** Grava as edições de uma sessão finalizada numa única transação (BL-074). */
export class SaveSessionEdits {
  constructor(private readonly deps: { db: Database }) {}

  async execute(input: { sessionId: number; changes: EditChanges }): Promise<void> {
    for (const c of input.changes.rows) {
      if (c.weight != null && (!Number.isFinite(c.weight) || c.weight < 0)) {
        throw new ValidationError('Informe um valor maior ou igual a 0');
      }
    }
    await this.deps.db.transaction(async (tx) => {
      const repos = createRepositories(tx);
      const s = await repos.sessions.getSession(input.sessionId);
      if (!s) throw new NotFoundError('Sessão não encontrada');
      if (s.finishedAt === null)
        throw new ValidationError('Sessão em andamento não é editável aqui');
      const ids = new Set(s.exercises.map((e) => e.exerciseId));
      for (const c of input.changes.rows) {
        if (!ids.has(c.exerciseId)) throw new NotFoundError('Exercício não pertence à sessão');
      }
      for (const c of input.changes.rows) {
        if (c.completed !== undefined) {
          await repos.sessions.setExerciseCompleted(input.sessionId, c.exerciseId, c.completed);
        }
        if (c.weight !== undefined) {
          await repos.sessions.setExerciseWeight(input.sessionId, c.exerciseId, c.weight);
        }
      }
    });
  }
}
