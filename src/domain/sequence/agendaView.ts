import type { AgendaDay, AgendaView, WeeklyDayEntry, WorkoutRef } from './types';

/** Monta a visão somente leitura da agenda semanal (SEG=1 até DOM=7). Pura. */
export function buildAgendaView(
  schedule: WeeklyDayEntry[],
  workouts: Pick<WorkoutRef, 'id' | 'name'>[],
): AgendaView {
  if (schedule.length === 0) return { kind: 'NO_SCHEDULE' };
  const byWeekday = new Map(schedule.map((e) => [e.weekday, e]));
  const days: AgendaDay[] = [];
  for (let weekday = 1; weekday <= 7; weekday++) {
    const entry = byWeekday.get(weekday);
    if (!entry) {
      days.push({ weekday, kind: 'REST' });
    } else if (entry.workoutId !== null) {
      const workout = workouts.find((w) => w.id === entry.workoutId);
      days.push(
        workout
          ? { weekday, kind: 'WORKOUT', workoutName: workout.name }
          : { weekday, kind: 'REST' },
      );
    } else if (entry.optional) {
      days.push({ weekday, kind: 'OPTIONAL', note: entry.note });
    } else {
      days.push({ weekday, kind: 'REST' });
    }
  }
  return { kind: 'DAYS', days };
}
