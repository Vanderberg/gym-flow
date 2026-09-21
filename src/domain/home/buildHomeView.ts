import { weekdayLabel } from '../../utils/weekdayLabel';
import { buildSequenceRail } from './buildSequenceRail';
import { buildWeekStrip } from './buildWeekStrip';
import type { HomeCard, HomeIndicator, HomeView, HomeViewInput, WorkoutSummary } from './types';

const summary = (w: WorkoutSummary): WorkoutSummary => ({
  id: w.id,
  code: w.code,
  name: w.name,
  exerciseCount: w.exerciseCount,
});

/** Monta a visão da Home. Pura: sem leitura nem escrita (BL-050). */
export function buildHomeView(input: HomeViewInput): HomeView {
  const { program, sequenceType, workouts, next, localDate, todayWeekday } = input;
  const weekly = sequenceType === 'WEEKLY';
  const dayLabel = weekly ? weekdayLabel(todayWeekday, 'LONG') : null;
  const summaries = workouts.map(summary);

  let indicator: HomeIndicator;
  if (!weekly) {
    indicator = { kind: 'RAIL', steps: buildSequenceRail(workouts, input.currentPosition) };
  } else if (input.schedule.length === 0) {
    indicator = { kind: 'NONE' };
  } else {
    const done = new Set<number>();
    for (const s of input.finished) {
      if (input.weekDates.includes(s.localDate)) done.add(s.weekday);
    }
    indicator = {
      kind: 'WEEK',
      days: buildWeekStrip(input.schedule, workouts, todayWeekday, [...done]),
    };
  }

  let card: HomeCard;
  let browsable: WorkoutSummary[] = [];
  if (input.inProgress) {
    const p = input.inProgress;
    card = {
      kind: 'IN_PROGRESS',
      sessionId: p.sessionId,
      workoutName: p.workoutName,
      done: p.done,
      total: p.total,
    };
  } else if (next.kind === 'WORKOUT') {
    const w = summaries.find((s) => s.id === next.workout.id) ?? {
      id: next.workout.id,
      code: next.workout.code,
      name: next.workout.name,
      exerciseCount: 0,
    };
    const doneToday =
      weekly && input.finished.some((s) => s.workoutId === w.id && s.localDate === localDate);
    card = { kind: 'WORKOUT', workout: w, dayLabel, doneToday };
  } else if (next.reason === 'REST') {
    card = { kind: 'REST', dayLabel: dayLabel ?? '', canBrowseWorkouts: true };
    browsable = summaries;
  } else if (next.reason === 'OPTIONAL_DAY') {
    card = {
      kind: 'OPTIONAL_DAY',
      dayLabel: dayLabel ?? '',
      note: next.note,
      canBrowseWorkouts: true,
    };
    browsable = summaries;
  } else if (next.reason === 'NO_SCHEDULE') {
    card = { kind: 'NO_SCHEDULE' };
  } else {
    card = { kind: 'NO_WORKOUTS' };
  }

  const suggestion = program.homeSuggestion?.trim() ? program.homeSuggestion : null;
  return {
    program: { id: program.id, name: program.name },
    sequenceType,
    indicator,
    card,
    suggestion,
    localDate,
    browsableWorkouts: browsable,
  };
}
