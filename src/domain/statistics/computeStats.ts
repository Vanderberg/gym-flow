import { daysBetween } from '../../utils/dateMath';
import type { PeriodRange, StatsResult } from './types';
import { weeksTouched } from './weeksTouched';

/** Métricas de frequência e cadência a partir das datas locais das sessões finalizadas. */
export function computeStats(dates: string[], range: PeriodRange, today: string): StatsResult {
  const last = today < range.end ? today : range.end;
  const inRange = dates.filter((d) => d >= range.start && d <= last).sort();
  const count = inRange.length;
  const weeks = weeksTouched(range, today);
  let averageIntervalDays: number | null = null;
  if (count >= 2) {
    let sum = 0;
    for (let i = 1; i < count; i++) {
      sum += daysBetween(inRange[i - 1] as string, inRange[i] as string);
    }
    averageIntervalDays = sum / (count - 1);
  }
  return { count, weeksTouched: weeks, weeklyAverage: count / weeks, averageIntervalDays };
}
