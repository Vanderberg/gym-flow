import type { SequenceStrategy } from '../SequenceStrategy';
import type { NextWorkoutResult, SequenceContext } from '../types';

export class WeeklyScheduleSequenceStrategy implements SequenceStrategy {
  readonly type = 'WEEKLY' as const;

  getNextWorkout(context: SequenceContext): NextWorkoutResult {
    const { schedule, workouts, today } = context;
    if (schedule.length === 0) return { kind: 'NONE', reason: 'NO_SCHEDULE', note: null };
    const entry = schedule.find((e) => e.weekday === today.weekday);
    if (!entry) return { kind: 'NONE', reason: 'REST', note: null };
    if (entry.workoutId !== null) {
      const workout = workouts.find((w) => w.id === entry.workoutId);
      return workout ? { kind: 'WORKOUT', workout } : { kind: 'NONE', reason: 'REST', note: null };
    }
    return entry.optional
      ? { kind: 'NONE', reason: 'OPTIONAL_DAY', note: entry.note }
      : { kind: 'NONE', reason: 'REST', note: null };
  }
}
