import { computeStats } from '../domain/statistics/computeStats';
import { periodRange } from '../domain/statistics/periodRange';
import type { Period, StatisticsView } from '../domain/statistics/types';
import type { SessionRepository } from '../domain/session/SessionRepository';
import { localDateOf, nowLocalIso, type Clock } from '../utils/localDate';

export interface GetStatisticsDeps {
  sessions: SessionRepository;
  clock: Clock;
}

/** Serviço centralizado de frequência/cadência; somente leitura (BL-080..087). */
export class GetStatistics {
  constructor(private readonly deps: GetStatisticsDeps) {}

  async execute(input: { period: Period; programId: number | null }): Promise<StatisticsView> {
    const { sessions, clock } = this.deps;
    const today = localDateOf(nowLocalIso(clock));
    const range = periodRange(input.period, today);
    const to = today < range.end ? today : range.end;
    const dates = await sessions.listFinishedDates({
      from: range.start,
      to,
      ...(input.programId !== null ? { programId: input.programId } : {}),
    });
    const programs = await sessions.listProgramsWithFinished();
    const hasAnySession =
      input.programId === null
        ? programs.length > 0
        : programs.some((p) => p.id === input.programId);
    const stats = computeStats(dates, range, today);
    return { ...stats, range, programFilter: input.programId, programs, hasAnySession };
  }
}
