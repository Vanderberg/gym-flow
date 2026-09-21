import { NotFoundError } from '../data/repositories/errors';
import { buildHomeView } from '../domain/home/buildHomeView';
import type { HomeView } from '../domain/home/types';
import type { ProgramRepository } from '../domain/program/ProgramRepository';
import type { ScheduleRepository } from '../domain/sequence/ScheduleRepository';
import type { SequenceStateRepository } from '../domain/sequence/SequenceStateRepository';
import type { NextWorkoutResolver } from '../domain/sequence/services/NextWorkoutResolver';
import type { SessionRepository } from '../domain/session/SessionRepository';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import { GetNextWorkout } from './GetNextWorkout';
import { localDateOf, nowLocalIso, type Clock } from '../utils/localDate';
import { weekdayOfLocalDate } from '../utils/weekday';

export interface GetHomeStateDeps {
  programs: ProgramRepository;
  schedule: ScheduleRepository;
  sequenceState: SequenceStateRepository;
  settings: SettingsRepository;
  sessions: SessionRepository;
  resolver: NextWorkoutResolver;
  clock: Clock;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Datas locais da semana (segunda a domingo) que contém `localDate`. */
function weekDatesOf(localDate: string): string[] {
  const [y, m, d] = localDate.split('-').map(Number);
  const monday = weekdayOfLocalDate(localDate) - 1;
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(y, m - 1, d - monday + i);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  });
}

/** Lê tudo e monta a HomeView. Não escreve nada (BL-050, SC-003). */
export class GetHomeState {
  constructor(private readonly deps: GetHomeStateDeps) {}

  async execute(): Promise<HomeView> {
    const { programs, schedule, sequenceState, sessions, clock } = this.deps;
    const { programId, sequenceType, result } = await new GetNextWorkout(this.deps).execute();
    const program = await programs.getProgram(programId);
    if (!program) throw new NotFoundError('Programa ativo não encontrado');

    const active = (await programs.listWorkouts(programId))
      .filter((w) => w.active)
      .sort((a, b) => a.position - b.position);
    const workouts = [];
    for (const w of active) {
      const detail = await programs.getWorkoutWithExercises(w.id);
      workouts.push({
        id: w.id,
        programId: w.programId,
        code: w.code,
        name: w.name,
        position: w.position,
        exerciseCount: detail?.exercises.length ?? 0,
      });
    }
    const state = await sequenceState.get(programId);
    const entries = await schedule.getSchedule(programId);
    const localDate = localDateOf(nowLocalIso(clock));
    const finished = (await sessions.listFinished({ programId })).map((s) => {
      const d = localDateOf(s.finishedAt as string);
      return { workoutId: s.workoutId, localDate: d, weekday: weekdayOfLocalDate(d) };
    });

    let inProgress = null;
    const open = await sessions.getInProgress();
    if (open) {
      const w = await programs.getWorkoutWithExercises(open.workoutId);
      inProgress = {
        sessionId: open.id,
        workoutName: w?.name ?? '',
        done: open.exercises.filter((e) => e.completed).length,
        total: open.exercises.length,
      };
    }

    return buildHomeView({
      program: { id: program.id, name: program.name, homeSuggestion: program.homeSuggestion },
      sequenceType,
      workouts,
      currentPosition: state?.currentPosition ?? null,
      schedule: entries.map((e) => ({
        weekday: e.weekday,
        workoutId: e.workoutId,
        optional: e.optional,
        note: e.note,
      })),
      next: result,
      localDate,
      todayWeekday: weekdayOfLocalDate(localDate),
      finished,
      weekDates: weekDatesOf(localDate),
      inProgress,
    });
  }
}
