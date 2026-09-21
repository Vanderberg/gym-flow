import type { HistoryItem } from '../domain/history/types';
import type { SessionRepository } from '../domain/session/SessionRepository';
import { formatDuration } from '../utils/duration';
import { localDateOf } from '../utils/localDate';

/** Lista as sessões finalizadas (BL-070, BL-071, BL-073). Somente leitura. */
export class ListHistory {
  constructor(private readonly deps: { sessions: SessionRepository }) {}

  async execute(opts?: { programId?: number }): Promise<HistoryItem[]> {
    const rows = await this.deps.sessions.listFinishedSummaries(opts);
    return rows.map((r) => ({
      ...r,
      localDate: localDateOf(r.finishedAt),
      durationLabel: formatDuration(r.startedAt, r.finishedAt),
      complete: r.total > 0 && r.done === r.total,
    }));
  }
}
