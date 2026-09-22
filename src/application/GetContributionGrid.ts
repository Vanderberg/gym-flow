import { addDays, mondayOf } from '../utils/dateMath';
import { buildContributionGrid } from '../domain/statistics/contributionGrid';
import type { ContributionGrid } from '../domain/statistics/contributionGrid';
import type { SessionRepository } from '../domain/session/SessionRepository';
import { localDateOf, nowLocalIso, type Clock } from '../utils/localDate';

export interface GetContributionGridDeps {
  sessions: SessionRepository;
  clock: Clock;
}

/** Grade de frequência das últimas N semanas (padrão 12), independente do período de Estatísticas. */
export class GetContributionGrid {
  constructor(private readonly deps: GetContributionGridDeps) {}

  async execute(input: { programId: number | null; weeks?: number }): Promise<ContributionGrid> {
    const { sessions, clock } = this.deps;
    const weeks = input.weeks ?? 12;
    const today = localDateOf(nowLocalIso(clock));
    const from = addDays(mondayOf(today), -7 * (weeks - 1));
    const dates = await sessions.listFinishedDates({
      from,
      to: today,
      ...(input.programId !== null ? { programId: input.programId } : {}),
    });
    return buildContributionGrid(dates, today, weeks);
  }
}
