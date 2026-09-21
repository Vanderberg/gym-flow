import type { WeeklyDayEntry } from '../sequence/types';
import { weekdayLabel } from '../../utils/weekdayLabel';
import type { WeekStripDay } from './types';

export function buildWeekStrip(
  schedule: WeeklyDayEntry[],
  workouts: { id: number; code: string }[],
  todayWeekday: number,
  doneWeekdays: number[],
): WeekStripDay[] {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
    const entry = schedule.find((e) => e.weekday === weekday);
    let label = '—';
    if (entry) {
      if (entry.workoutId !== null) {
        label = workouts.find((w) => w.id === entry.workoutId)?.code ?? '—';
      } else if (entry.optional) {
        label = 'opc.';
      }
    }
    return {
      weekday,
      label,
      isToday: weekday === todayWeekday,
      hasSession: doneWeekdays.includes(weekday),
    };
  });
}

export { weekdayLabel };
