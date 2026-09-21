import { NotFoundError, ValidationError } from '../data/repositories/errors';
import type { SessionRepository } from '../domain/session/SessionRepository';
import { parseWeightInput } from '../domain/workout/weight';

/** Grava o peso digitado (vírgula ou ponto) na sessão em andamento (BL-063). */
export class SetExerciseWeight {
  constructor(private readonly deps: { sessions: SessionRepository }) {}

  async execute(input: {
    sessionId: number;
    exerciseId: number;
    text: string;
  }): Promise<{ weight: number | null }> {
    const parsed = parseWeightInput(input.text);
    if (!parsed.ok) throw new ValidationError('Informe um valor maior ou igual a 0');
    const s = await this.deps.sessions.getSession(input.sessionId);
    if (!s) throw new NotFoundError('Sessão não encontrada');
    if (s.finishedAt !== null) throw new ValidationError('Sessão finalizada não pode ser editada');
    await this.deps.sessions.setExerciseWeight(input.sessionId, input.exerciseId, parsed.value);
    return { weight: parsed.value };
  }
}
