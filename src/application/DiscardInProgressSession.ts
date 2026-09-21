import type { SessionRepository } from '../domain/session/SessionRepository';

/** Descarta a sessão em andamento (se houver). Não altera sequência nem estatísticas. */
export class DiscardInProgressSession {
  constructor(private readonly deps: { sessions: SessionRepository }) {}

  async execute(): Promise<void> {
    const current = await this.deps.sessions.getInProgress();
    if (!current) return;
    await this.deps.sessions.discardSession(current.id);
  }
}
