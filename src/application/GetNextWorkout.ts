import type { ProgramRepository } from '../domain/program/ProgramRepository';
import type { ScheduleRepository } from '../domain/sequence/ScheduleRepository';
import type { SequenceStateRepository } from '../domain/sequence/SequenceStateRepository';
import type { NextWorkoutResolver } from '../domain/sequence/services/NextWorkoutResolver';
import type { NextWorkoutResult } from '../domain/sequence/types';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import type { SequenceType } from '../domain/settings/types';
import { NotFoundError } from '../data/repositories/errors';
import { localDateOf, nowLocalIso, type Clock } from '../utils/localDate';
import { weekdayOfLocalDate } from '../utils/weekday';

export interface GetNextWorkoutDeps {
  programs: ProgramRepository;
  schedule: ScheduleRepository;
  sequenceState: SequenceStateRepository;
  settings: SettingsRepository;
  resolver: NextWorkoutResolver;
  clock: Clock;
}

export class GetNextWorkout {
  constructor(private readonly deps: GetNextWorkoutDeps) {}

  async execute(): Promise<{
    programId: number;
    sequenceType: SequenceType;
    result: NextWorkoutResult;
  }> {
    const { programs, schedule, sequenceState, settings, resolver, clock } = this.deps;
    const s = await settings.get();
    if (!s) throw new NotFoundError('Configurações não encontradas');
    const programId = s.activeProgramId;
    const workouts = (await programs.listWorkouts(programId))
      .filter((w) => w.active)
      .sort((a, b) => a.position - b.position)
      .map((w) => ({
        id: w.id,
        programId: w.programId,
        code: w.code,
        name: w.name,
        position: w.position,
      }));
    const state = await sequenceState.get(programId);
    const entries = await schedule.getSchedule(programId);
    const weekday = weekdayOfLocalDate(localDateOf(nowLocalIso(clock)));
    const result = resolver.resolve(s.sequenceType, {
      programId,
      workouts,
      currentPosition: state?.currentPosition ?? null,
      schedule: entries.map((e) => ({
        weekday: e.weekday,
        workoutId: e.workoutId,
        optional: e.optional,
        note: e.note,
      })),
      today: { weekday },
    });
    return { programId, sequenceType: s.sequenceType, result };
  }
}
